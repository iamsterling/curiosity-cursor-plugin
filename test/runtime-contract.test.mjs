import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { compileHandoff } from "../skills/handoff-compiler/compiler.mjs"
import { attachContract, readNativeState, writeNativeState } from "../src/loop-state.mjs"
import { applyRuntimeContractRetry, setGoalComplete } from "../src/index.js"

const root = path.resolve(import.meta.dirname, "..")
const digest = async (target) => `sha256:${createHash("sha256").update(await fs.readFile(target)).digest("hex")}`

async function contractJob(directory) {
  const source = JSON.parse(await fs.readFile(path.join(root, "skills/handoff-compiler/fixtures/B-behavioral-bug.json"), "utf8"))
  source.contract.contexts = []
  const proposal = compileHandoff(source)
  const job = await attachContract({ id: "goal", name: "goal", kind: "goal", goalStatus: "active", goalRequireEvidence: false }, proposal, { directory })
  return job
}

test("actual completion path rejects worker semantic forgery without crashing", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "runtime-contract-"))
  try {
    const evidencePath = path.join(directory, "evidence.json")
    await fs.writeFile(evidencePath, "{}\n")
    const evidenceDigest = await digest(evidencePath)
    const evidenceRefs = ["red", "green", "command-output"].map((kind) => ({ criterionId: "rejects", kind, locator: "evidence.json", digest: evidenceDigest }))
    await writeNativeState(path.join(directory, ".opencode/opencode2-config/session.json"), { version: 1, jobs: [await contractJob(directory)] })
    const result = await setGoalComplete(directory, "session", { summary: "worker claim", evidence: "bun test: exit 0", evidenceRefs })
    assert.equal(result.ok, false)
    assert.equal(result.job.goalCompletionRejectedReason, "OPENCODE2_SEMANTIC_COMPLETION_REQUIRED")
  } finally { await fs.rm(directory, { recursive: true, force: true }) }
})

test("manual override is explicit and logged on actual completion path", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "runtime-contract-"))
  try {
    await writeNativeState(path.join(directory, ".opencode/opencode2-config/session.json"), { version: 1, jobs: [await contractJob(directory)] })
    const result = await setGoalComplete(directory, "session", { summary: "operator accepted", manualOverride: true })
    assert.equal(result.ok, true)
    assert.equal(result.job.contract.manualOverride.actor, "user")
    assert.equal(result.job.contract.manualOverride.ordinaryEvidenceCompletion, false)
    const log = await fs.readFile(path.join(directory, ".opencode/opencode2-config/loop.log"), "utf8")
    assert.match(log, /goal-manual-override/)
  } finally { await fs.rm(directory, { recursive: true, force: true }) }
})

test("runtime retry paths reject unchanged non-transport retries and preserve provider replay", async () => {
  const job = { ...(await contractJob(root)), agent: "reviewer" }
  assert.throws(() => applyRuntimeContractRetry(job, "failed-verification", {}), /OPENCODE2_RETRY_DELTA_REQUIRED/)
  assert.throws(() => applyRuntimeContractRetry(job, "reviewer-rejection", { diagnosis: "rejected" }), /OPENCODE2_RETRY_DELTA_REQUIRED/)
  assert.doesNotThrow(() => applyRuntimeContractRetry(job, "transport\/provider", {}))
  const retried = applyRuntimeContractRetry(job, "failed-verification", { diagnosis: "test failed", changedInstructions: ["Fix the failing assertion"] })
  assert.equal(retried.contract.lastRetry.failureClass, "failed-verification")
})

test("reviewer retry input is validated by the runtime adapter", async () => {
  const job = { ...(await contractJob(root)), contractRetry: { failureClass: "reviewer-rejection", diagnosis: "review failed" } }
  assert.throws(() => applyRuntimeContractRetry(job, job.contractRetry.failureClass, job.contractRetry), /OPENCODE2_RETRY_DELTA_REQUIRED/)
  job.contractRetry.changedInstructions = ["Address the cited invariant violation"]
  assert.equal(applyRuntimeContractRetry(job, job.contractRetry.failureClass, job.contractRetry).contract.lastRetry.failureClass, "reviewer-rejection")
})

test("ordinary CLI exposes no semantic attestation command", async () => {
  const source = await fs.readFile(path.join(root, "scripts/state-tool.mjs"), "utf8")
  assert.doesNotMatch(source, /attest-completion/)
})
