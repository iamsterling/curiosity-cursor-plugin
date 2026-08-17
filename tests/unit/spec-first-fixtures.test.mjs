import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const fixture = JSON.parse(await readFile(new URL("../fixtures/spec-first-contracts.json", import.meta.url), "utf8"))

const evaluate = (input) => {
  if (input.unknown === "DISCOVERABLE" && input.repositoryEvidence) return input.askOwner === false && input.visibleContractBeforeWriter ? "CONTINUE" : "INVALID"
  if (input.unknown === "HARMLESS") return input.defaultRecorded && input.rollbackRecorded && input.askOwner === false ? "CONTINUE" : "INVALID"
  if (input.unknown === "CONSEQUENTIAL") return input.askQuestionAvailable ? (input.finiteOptions ? "ASKQUESTION" : "INVALID") : (input.finiteOptions ? "USER_DECISION_REQUIRED" : "INVALID")
  if (input.route) return input.specPhase === "AUTOMATIC" && input.persistBeforeMutation ? "CONTINUE" : "INVALID"
  if (input.persistedRevision && input.persistedRevision !== input.requestedRevision) return "BLOCKED_EVIDENCE/SPEC_STALE_OR_MISMATCHED"
  if (input.persistTaskId) return input.persistTaskId === input.mutationTaskId && input.writerCount === 1 ? "CONTINUE" : "INVALID"
  if (input.approvedDigest !== undefined) return input.approvedDigest === input.persistedDigest ? "CONTINUE" : "BLOCKED_EVIDENCE/SPEC_STALE_OR_MISMATCHED"
  if (input.requiredCheck && !input.checkAvailable) return "BLOCKED_EVIDENCE/REQUIRED_CHECK_UNAVAILABLE"
  if (input.requiredCheck && input.exitStatus !== 0) return "BLOCKED_EVIDENCE/REQUIRED_CHECK_FAILED"
  return "INVALID"
}

test("static spec-first fixtures encode repository, question, persistence, and full-check outcomes", () => {
  assert.equal(fixture.schemaVersion, 1)
  assert.equal(fixture.cases.length, 11)
  for (const item of fixture.cases) {
    const expected = item.reason ? `${item.outcome}/${item.reason}` : item.outcome
    assert.equal(evaluate(item), expected, item.id)
  }
})

test("meaningful bypass mutants are rejected", () => {
  const byId = Object.fromEntries(fixture.cases.map((item) => [item.id, structuredClone(item)]))
  for (const [id, mutate] of [
    ["oidc-repository-fact", (v) => { v.askOwner = true }],
    ["automatic-bug-spec", (v) => { v.persistBeforeMutation = false }],
    ["askquestion-path", (v) => { v.finiteOptions = false }],
    ["harmless-default", (v) => { v.rollbackRecorded = false }],
    ["same-writer", (v) => { v.mutationTaskId = "task-2" }],
    ["required-lint-failed", (v) => { v.exitStatus = 0 }]
  ]) {
    mutate(byId[id])
    const expected = byId[id].reason ? `${byId[id].outcome}/${byId[id].reason}` : byId[id].outcome
    assert.notEqual(evaluate(byId[id]), expected, id)
  }
})
