import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import {
  DiagnosticError,
  Ledger,
  decodeLedgerEvent,
  digestCanonical,
} from "../../dist/features/ledger/index.js"

const criterion = { id: "c1", revision: 1, observable: "exit status", oracle: "equals zero", requiredEvidence: ["test-green"], scenarios: ["s1"] }
const intent = { id: "i1", objective: "change behavior", invariant: "no regression", scope: ["src/a.ts"], nonGoals: [], rigor: "behavioral", revision: 1 }

const code = async (run) => { try { await run(); return "" } catch (error) { assert.ok(error instanceof DiagnosticError); return error.code } }

test("strict event decoding rejects future versions and unknown nested fields", () => {
  assert.throws(() => decodeLedgerEvent({ schemaVersion: 2 }), /LEDGER_VERSION_UNSUPPORTED/)
  assert.throws(() => decodeLedgerEvent({ schemaVersion: 1, id: "e", sequence: 1, aggregate: "i1", type: "intent.captured", at: "x", actor: { kind: "user", sessionID: "s", extra: true }, data: {} }), /LEDGER_SCHEMA_INVALID/)
})

test("canonical digests are key-order independent", () => {
  assert.equal(digestCanonical({ b: 2, a: 1 }), digestCanonical({ a: 1, b: 2 }))
})

test("claim-ready CAS has exactly one winner and overlapping work is rejected", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ledger-v1-"))
  try {
    const ledger = await Ledger.open(directory)
    await ledger.captureIntent(intent, { kind: "root-user", sessionID: "root" })
    await ledger.frameIntent("i1", [criterion], { kind: "model", sessionID: "root" })
    await ledger.activateIntent("i1", { kind: "root-user", sessionID: "root" })
    await ledger.proposeWork({ id: "w1", intentID: "i1", intentRevision: 1, criterionIDs: ["c1"], writableScope: ["src/a.ts"], state: "pending" })
    assert.equal(await code(() => ledger.proposeWork({ id: "w2", intentID: "i1", intentRevision: 1, criterionIDs: ["c1"], writableScope: ["src/a.ts/x"], state: "pending" })), "LEDGER_WORK_SCOPE_CONFLICT")
    const results = await Promise.allSettled([
      ledger.claimReady("w1", { sessionID: "s1", rootSessionID: "root", token: "t1" }),
      ledger.claimReady("w1", { sessionID: "s2", rootSessionID: "root", token: "t2" }),
    ])
    assert.equal(results.filter((item) => item.status === "fulfilled").length, 1)
    assert.equal(results.filter((item) => item.status === "rejected").length, 1)
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("synthetic approval and artifact-only completion fail closed", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ledger-v1-"))
  try {
    const ledger = await Ledger.open(directory)
    await ledger.captureIntent({ ...intent, rigor: "destructive" }, { kind: "root-user", sessionID: "root" })
    const approval = await ledger.requestApproval("i1", "destructive-change", "root")
    assert.equal(await code(() => ledger.confirmApproval(approval.id, { kind: "synthetic", sessionID: "root", correlationID: approval.id })), "LEDGER_APPROVAL_AUTHORITY_INVALID")
    assert.equal(await code(() => ledger.reconcile("i1")), "LEDGER_INTENT_NOT_RESOLVABLE")
  } finally { await rm(directory, { recursive: true, force: true }) }
})
