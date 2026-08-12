import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { decodeLoopJournal, NativeLoopEngine } from "../../dist/features/loop-engine/index.js"

const startInput = {
  claim: { workID: "work", token: "token", revision: 2, digest: "sha256:claim" },
  rootSessionID: "root",
  dispatch: { id: "dispatch", digest: "sha256:dispatch" },
  budgets: { maxIterations: 4, maxNoProgress: 3, maxChildren: 2, maxTools: 4 },
}

test("strict journal codec rejects unknown and malformed nested state", () => {
  assert.throws(() => decodeLoopJournal({ schemaVersion: 1, surprise: true }), { code: "LOOP_JOURNAL_SCHEMA_INVALID" })
})

test("continuation requires positive authority, continuity, lineage, and ledger advance", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "native-loop-completion-"))
  const prompts = []
  try {
    const engine = await NativeLoopEngine.open(directory, {
      prompt: async (value) => prompts.push(value),
      interrupt: async () => {},
      validateContinuation: async () => ({ claim: "current", fence: "current" }),
    })
    await engine.start(startInput)
    await engine.observeTerminal({
      id: "terminal-1",
      sessionID: "root",
      evidenceCursor: 1,
      ledgerRevision: 3,
      ledgerAdvanceAccepted: true,
      descendantsTerminal: true,
      toolsTerminal: true,
      lineageProven: true,
      captureContinuous: true,
      interrupted: false,
    })
    assert.equal(prompts.length, 2)
    assert.equal((await engine.status()).dispatchState, "dispatched")

    await engine.observeTerminal({
      id: "terminal-2",
      sessionID: "root",
      evidenceCursor: 2,
      ledgerRevision: 4,
      ledgerAdvanceAccepted: true,
      descendantsTerminal: true,
      toolsTerminal: true,
      lineageProven: false,
      captureContinuous: true,
      interrupted: false,
    })
    assert.equal(prompts.length, 2)
    assert.equal((await engine.status()).stopReason, "LOOP_LINEAGE_AMBIGUOUS")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("restart fails closed for an unproved dispatched prompt", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "native-loop-restart-"))
  try {
    const engine = await NativeLoopEngine.open(directory, { prompt: async () => {}, interrupt: async () => {} })
    await engine.start(startInput)
    const reopened = await NativeLoopEngine.open(directory, { prompt: async () => {}, interrupt: async () => {} })
    assert.equal((await reopened.status()).mode, "ambiguous")
    assert.equal((await reopened.status()).stopReason, "LOOP_RESTART_OUTCOME_AMBIGUOUS")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("restart reconciles a proven forward dispatch transition without redispatch", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "native-loop-restart-forward-"))
  const prompts = []
  try {
    const engine = await NativeLoopEngine.open(directory, { prompt: async (value) => prompts.push(value), interrupt: async () => {} })
    await engine.start(startInput)
    const reopened = await NativeLoopEngine.open(directory, {
      prompt: async (value) => prompts.push(value), interrupt: async () => {},
      reconcileDispatch: async () => "executing",
    })
    assert.equal((await reopened.status()).dispatchState, "executing")
    assert.equal((await reopened.status()).mode, "running")
    assert.equal(prompts.length, 1)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("interrupt request is finalized only by the root terminal event", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "native-loop-interrupt-"))
  try {
    const engine = await NativeLoopEngine.open(directory, { prompt: async () => {}, interrupt: async () => {} })
    await engine.start(startInput)
    await engine.stop()
    await engine.observeTerminal({ id: "child-terminal", sessionID: "child", evidenceCursor: 0, descendantsTerminal: true, toolsTerminal: true })
    assert.equal((await engine.status()).mode, "stopping")
    await engine.observeTerminal({ id: "root-terminal", sessionID: "root", evidenceCursor: 0, descendantsTerminal: true, toolsTerminal: true })
    assert.equal((await engine.status()).mode, "stopped")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("compaction references and watermark must bridge the continuation boundary", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "native-loop-compaction-"))
  const prompts = []
  try {
    const engine = await NativeLoopEngine.open(directory, {
      prompt: async (value) => prompts.push(value), interrupt: async () => {},
      validateContinuation: async () => ({ claim: "current", fence: "current" }),
    })
    await engine.start(startInput)
    await engine.prepareCompaction(["evidence:1"], 7)
    await engine.completeCompaction(["evidence:1"], 6)
    assert.equal((await engine.status()).stopReason, "LOOP_COMPACTION_CONTINUITY_AMBIGUOUS")
    assert.equal(prompts.length, 1)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("repeated failure breaker takes precedence over no-progress", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "native-loop-breaker-"))
  try {
    const engine = await NativeLoopEngine.open(directory, {
      prompt: async () => {}, interrupt: async () => {},
      validateContinuation: async () => ({ claim: "current", fence: "current" }),
    })
    await engine.start({ ...startInput, budgets: { ...startInput.budgets, maxNoProgress: 1 } })
    await engine.observeTerminal({ id: "terminal", sessionID: "root", evidenceCursor: 0, descendantsTerminal: true,
      toolsTerminal: true, failureSignature: "E_FAIL" })
    assert.equal((await engine.status()).stopReason, "LOOP_REPEATED_FAILURE_LIMIT")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
