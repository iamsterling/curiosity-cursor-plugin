import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { NativeLoopEngine } from "../../dist/features/loop-engine/index.js"

test("duplicate unproved terminal events never continue and remain ambiguous", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "loop-v1-"))
  const prompts = []
  try {
    const engine = await NativeLoopEngine.open(directory, { prompt: async (value) => prompts.push(value), interrupt: async () => {} })
    await engine.start({ claim: { workID: "w", token: "t", revision: 1, digest: "sha256:x" }, rootSessionID: "root", dispatch: { id: "d", digest: "sha256:d" }, budgets: { maxIterations: 3, maxNoProgress: 1, maxChildren: 2, maxTools: 4 } })
    assert.equal(prompts.length, 1)
    await engine.observeTerminal({ id: "terminal-1", sessionID: "root", evidenceCursor: 0, descendantsTerminal: true, toolsTerminal: true })
    await engine.observeTerminal({ id: "terminal-1", sessionID: "root", evidenceCursor: 0, descendantsTerminal: true, toolsTerminal: true })
    assert.equal(prompts.length, 1)
    assert.equal((await engine.status()).mode, "ambiguous")
    assert.equal((await engine.status()).stopReason, "LOOP_LINEAGE_AMBIGUOUS")
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("user input and ambiguous lineage pause continuation", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "loop-v1-"))
  try {
    const engine = await NativeLoopEngine.open(directory, { prompt: async () => {}, interrupt: async () => {} })
    await engine.start({ claim: { workID: "w", token: "t", revision: 1, digest: "sha256:x" }, rootSessionID: "root", dispatch: { id: "d", digest: "sha256:d" }, budgets: { maxIterations: 3, maxNoProgress: 2, maxChildren: 2, maxTools: 4 } })
    await engine.observeUserInput({ sessionID: "root", inputID: "human", type: "user" })
    assert.equal((await engine.status()).mode, "paused")
  } finally { await rm(directory, { recursive: true, force: true }) }
})
