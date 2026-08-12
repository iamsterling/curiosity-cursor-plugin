import assert from "node:assert/strict"
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { compileHandoff } from "../skills/handoff-compiler/compiler.mjs"
import {
  DiagnosticError, decodeNativeState, readNativeState, writeNativeState,
  importLegacyV4, attachContract, checkContractDispatch, recordContractProgress,
  recordContractCompletion, attestSemanticCompletion, validateContractRetry,
  compactionManualRequired,
} from "../src/loop-state.mjs"

const root = path.resolve(import.meta.dirname, "..")
const fixture = (name) => path.join(root, "test/fixtures", name)
const code = async (fn) => { try { await fn(); return "" } catch (error) { assert.ok(error instanceof DiagnosticError); return error.code } }
const proposal = async () => compileHandoff(JSON.parse(await fs.readFile(path.join(root, "skills/handoff-compiler/fixtures/B-behavioral-bug.json"), "utf8")))

test("native state rejects missing, future, corrupt, and v4 versions without coercion", async () => {
  assert.equal(await code(() => Promise.resolve(decodeNativeState({ jobs: [] }))), "OPENCODE2_STATE_VERSION_UNSUPPORTED")
  assert.equal(await code(async () => decodeNativeState(JSON.parse(await fs.readFile(fixture("native-future.json"), "utf8")))), "OPENCODE2_STATE_VERSION_UNSUPPORTED")
  assert.equal(await code(async () => decodeNativeState(JSON.parse(await fs.readFile(fixture("legacy-valid-v4.json"), "utf8")))), "OPENCODE2_STATE_VERSION_UNSUPPORTED")
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "state-red-"))
  try {
    await fs.writeFile(path.join(dir, "s.json"), "{")
    assert.equal(await code(() => readNativeState(path.join(dir, "s.json"))), "OPENCODE2_STATE_CORRUPT")
    assert.deepEqual(await readNativeState(path.join(dir, "absent.json")), { version: 1, jobs: [] })
  } finally { await fs.rm(dir, { recursive: true, force: true }) }
})

test("legacy v4 import is explicit, source preserving, idempotent, and target protecting", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "import-red-"))
  const source = path.join(dir, "legacy.json"), target = path.join(dir, "native.json")
  try {
    await fs.copyFile(fixture("legacy-valid-v4.json"), source)
    const before = await fs.readFile(source)
    const dry = await importLegacyV4({ source, target, mode: "dry-run", toolVersion: "test" })
    assert.equal(dry.state.version, 1); assert.equal(await fs.stat(target).then(() => true, () => false), false)
    await importLegacyV4({ source, target, mode: "apply", toolVersion: "test", importedAt: "2026-08-11T00:00:00.000Z" })
    assert.deepEqual(await fs.readFile(source), before)
    const state = await readNativeState(target)
    assert.equal(state.jobs[0].id, "legacy-goal"); assert.equal(state.jobs[0].runCount, 7)
    assert.match(state.imports[0].sourceDigest, /^sha256:[a-f0-9]{64}$/)
    assert.equal(await code(() => importLegacyV4({ source, target, mode: "apply", toolVersion: "test" })), "OPENCODE2_LEGACY_IMPORT_ALREADY_APPLIED")
    await writeNativeState(target, { version: 1, jobs: [{ id: "native" }] })
    assert.equal(await code(() => importLegacyV4({ source, target, mode: "apply", toolVersion: "test" })), "OPENCODE2_LEGACY_IMPORT_TARGET_NOT_EMPTY")
    assert.equal(await code(() => importLegacyV4({ source: fixture("legacy-unknown.json"), target: path.join(dir, "x"), mode: "dry-run", toolVersion: "test" })), "OPENCODE2_LEGACY_IMPORT_VERSION_UNSUPPORTED")
    assert.equal(await code(() => importLegacyV4({ source: fixture("legacy-corrupt.json"), target: path.join(dir, "x"), mode: "dry-run", toolVersion: "test" })), "OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID")
    await fs.copyFile(fixture("interrupted-import.json"), path.join(dir, "interrupted.json"))
    assert.equal(await code(() => importLegacyV4({ source, target: path.join(dir, "interrupted.json"), mode: "apply", toolVersion: "test" })), "OPENCODE2_STATE_SCHEMA_INVALID")
  } finally { await fs.rm(dir, { recursive: true, force: true }) }
})

test("contract attachment enforces digest and monotonic revision", async () => {
  const p = await proposal(); const job = { id: "goal", kind: "goal" }
  const attached = await attachContract(job, p, { directory: root })
  assert.equal(attached.contract.contractId, "bug-001")
  assert.equal(await code(() => attachContract(job, { ...p, digest: "0".repeat(64) }, { directory: root })), "OPENCODE2_CONTRACT_DIGEST_MISMATCH")
  const rollback = compileHandoff({ decisions: { state: "clear", objective: p.contract.objective }, authority: { policyStatus: "allowed", parallelAuthorized: false }, contract: { ...p.contract, revision: 1 } })
  assert.equal(await code(() => attachContract(attached, rollback, { directory: root })), "OPENCODE2_CONTRACT_REVISION_CONFLICT")
  assert.equal(await code(() => attachContract(attached, { ...p, digest: "1".repeat(64) }, { directory: root })), "OPENCODE2_CONTRACT_DIGEST_MISMATCH")
})

test("contract lifecycle rejects fake progress, blocked dependencies, missing evidence, and worker completion forgery", async () => {
  const p = await proposal()
  let job = await attachContract({ id: "goal", kind: "goal", noProgressCount: 2 }, p, { directory: root })
  assert.equal(await code(() => recordContractProgress(job, { summary: "done" }, { directory: root })), "OPENCODE2_PROGRESS_DELTA_REQUIRED")
  const blocked = structuredClone(job); blocked.contract.dependencies = [{ id: "d", producer: "a", consumer: "b", status: "unmet" }]
  assert.equal(await code(() => checkContractDispatch(blocked, { directory: root })), "OPENCODE2_DEPENDENCY_BLOCKED")
  assert.equal(await code(() => recordContractCompletion(job, { actor: "worker", evidenceRefs: [] }, { directory: root })), "OPENCODE2_CRITERION_EVIDENCE_MISSING")
  const evidenceFile = path.join(root, "test/fixtures/native-empty-v1.json")
  const digest = `sha256:${await fs.readFile(evidenceFile).then((b) => import("node:crypto").then(({createHash}) => createHash("sha256").update(b).digest("hex")))}`
  const evidenceRefs = ["red", "green", "command-output"].map((kind) => ({ criterionId: "rejects", kind, locator: "test/fixtures/native-empty-v1.json", digest }))
  assert.equal(await code(() => recordContractCompletion(job, { actor: "worker", evidenceRefs }, { directory: root })), "OPENCODE2_SEMANTIC_COMPLETION_REQUIRED")
  job = await attestSemanticCompletion(job, { authority: "external-loop-evidence", attestationRef: evidenceRefs[0] }, { directory: root })
  const completed = await recordContractCompletion(job, { actor: "worker", evidenceRefs }, { directory: root })
  assert.equal(completed.goalStatus, "completed")
})

test("context, retry, compaction, and property mutations produce stable diagnostics", async () => {
  const p = await proposal(); let job = await attachContract({ id: "goal", kind: "goal" }, p, { directory: root })
  const missingContext = structuredClone(job)
  missingContext.contract.contexts = [{ id: "missing", contextType: "artifact", locator: "test/fixtures/does-not-exist", digest: `sha256:${"0".repeat(64)}`, required: true }]
  assert.equal(await code(() => checkContractDispatch(missingContext, { directory: root })), "OPENCODE2_CONTEXT_REF_MISSING")
  const mismatchedContext = structuredClone(job)
  mismatchedContext.contract.contexts = [{ id: "bad", contextType: "artifact", locator: "test/fixtures/native-empty-v1.json", digest: `sha256:${"0".repeat(64)}`, required: true }]
  assert.equal(await code(() => checkContractDispatch(mismatchedContext, { directory: root })), "OPENCODE2_CONTEXT_DIGEST_MISMATCH")
  assert.equal(await code(() => validateContractRetry(job, { failureClass: "failed-verification" })), "OPENCODE2_RETRY_DELTA_REQUIRED")
  assert.doesNotThrow(() => validateContractRetry(job, { failureClass: "transport/provider" }))
  assert.equal(compactionManualRequired().code, "OPENCODE2_COMPACTION_MANUAL_REQUIRED")
  const samples = [null, [], {}, { version: 1 }, { version: 1, jobs: "x" }, { version: 1, jobs: [null] }, { version: 1, jobs: [{ id: 1 }] }]
  for (const sample of samples) {
    try { decodeNativeState(sample) } catch (error) { assert.ok(error instanceof DiagnosticError); assert.match(error.code, /^OPENCODE2_STATE_/) }
  }
})
