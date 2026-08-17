import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const names = ["deliver-change", "bug", "feature", "deep-research", "review", "secure", "verify", "architecture", "spec", "ledger", "implement", "close"]
const writable = new Set([
  "deliver-change/BOUNDED", "deliver-change/ARCHITECTURAL", "bug/REPAIR", "feature/BOUNDED", "feature/ARCHITECTURAL",
  "secure/AUTHORIZED_FIX", "spec/PERSIST", "ledger/CHECKPOINT", "ledger/RESUME", "ledger/CLOSE", "implement/APPROVED_CHANGE", "close/ARCHIVE",
])

const load = async (name) => {
  const source = await read(`commands/curiosity-${name}.md`)
  return { source, contract: JSON.parse(source.match(/<!-- ROUTE_CONTRACT\n([\s\S]*?)\n-->/)[1]) }
}

const validateWriter = (name, branch) => {
  assert.deepEqual(branch.specPhase, {
    automatic: true,
    contract: "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN",
    approvalRequired: true,
    persistenceRequiredBeforeMutation: true,
    exactSpecRefRequired: true,
    staleOrMismatch: "BLOCKED_EVIDENCE SPEC_STALE_OR_MISMATCHED",
    sameTaskId: true,
  }, `${name}/${branch.intent}`)
  assert.equal(branch.writerCount, 1)
  assert.equal(branch.ownerGate, "REQUIRED")
  assert.deepEqual(branch.terminalStatuses, ["BLOCKED_ROUTING", "BLOCKED_AUTHORITY", "USER_DECISION_REQUIRED", "BLOCKED_EVIDENCE", "DONE"])
  assert.equal(branch.tasks.filter(({ agent, invocationMode }) => agent === "curiosity-implementer" && invocationMode === "SPEC_PERSIST_AND_MUTATE").length, 1)
}

test("every writer route automatically freezes, persists, and binds one exact spec", async () => {
  for (const name of names) {
    const { contract } = await load(name)
    assert.deepEqual(contract.specAuthority, {
      schema: "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN",
      package: "openspec/changes/<change-id>-rNNNN",
      approvalCommitMarker: "approval.md",
      planTodoTasksAuthority: "NON_AUTHORITATIVE_PROJECTION",
      approvalAggregate: {
        field: "contract_sha256",
        algorithm: "SHA256_UINT64BE_LENGTH_FRAMED_PATH_AND_FILE_BYTES_V1",
        pathOrder: "UTF8_BYTEWISE_ASCENDING",
        included: ["design.md", "proposal.md", "specs/<slug>/spec.md"],
        excluded: ["tasks.md", "approval.md", "evidence.md"],
      },
    }, name)
    for (const branch of contract.branches) {
      const key = `${name}/${branch.intent}`
      if (writable.has(key)) validateWriter(name, branch)
      else assert.equal(branch.specPhase, undefined, `${key}: read-only remains proportional`)
    }
  }
})

test("writer-route mutants cannot bypass persistence, exact binding, or the sole writer", async () => {
  const branch = structuredClone((await load("bug")).contract.branches[0])
  for (const mutate of [
    (value) => { value.specPhase.automatic = false },
    (value) => { value.specPhase.persistenceRequiredBeforeMutation = false },
    (value) => { value.specPhase.exactSpecRefRequired = false },
    (value) => { value.specPhase.sameTaskId = false },
    (value) => { value.ownerGate = "NONE" },
    (value) => { value.writerCount = 2 },
    (value) => { value.tasks.unshift(structuredClone(value.tasks[0])) },
  ]) {
    const changed = structuredClone(branch); mutate(changed)
    assert.throws(() => validateWriter("bug", changed))
  }
})

test("canonical rule defines complete visible contract, questions, immutable persistence, and exact stops", async () => {
  const rule = await read("rules/curiosity-delivery.mdc")
  for (const token of [
    "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN", "DISCOVERABLE", "HARMLESS", "CONSEQUENTIAL", "DEC-", "REQ-", "SCN-", "AC-", "DOD-",
    "approval ID", "content SHA", "persistence receipt", "execution linkage", "DRAFT", "APPROVED_NOT_PERSISTED", "SPEC_STALE_OR_MISMATCHED",
    "AskQuestion", "maximum three", "maximum two batches", "recommended option first", "USER_DECISION_REQUIRED", "NON_AUTHORITATIVE_PROJECTION",
    "approval.md", "written last", "staged sibling", "read-back", "no overwrite", "PARTIAL_PERSISTENCE", "PATH_CONFLICT",
  ]) assert.match(rule, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), token)
  assert.match(rule, /model-steered[^.]*host availability/i)
  assert.match(rule, /discoverable[^.]*must not[^.]*question/i)
  assert.match(rule, /consequential[^.]*never[^.]*default/i)
})

test("implementation and review bind required checks and exact audit package", async () => {
  const implementation = await read("skills/curiosity-implementation-discipline/SKILL.md")
  for (const token of ["spec_ref", "revision", "content SHA", "REQUIRED_CHECK_UNAVAILABLE", "REQUIRED_CHECK_FAILED", "npm test", "npm run lint", "focused GREEN", "raw output"]) assert.match(implementation, new RegExp(token, "i"), token)
  assert.match(implementation, /discover[^.]*package scripts[^.]*CI[^.]*contributing/i)
  assert.match(implementation, /focused[^.]*never substitutes[^.]*full/i)
  const review = `${await read("skills/curiosity-independent-review/SKILL.md")}\n${await read("agents/curiosity-reviewer.md")}`
  assert.match(review, /exact persisted spec_ref[^.]*revision[^.]*digest/i)
  assert.match(review, /criterion[^.]*required evidence[^.]*DOD/i)
  assert.match(review, /audit package parity/i)
})

test("deep research exposes independent dimensions and exact reason codes", async () => {
  const { source, contract } = await load("deep-research")
  assert.deepEqual(contract.branches[0].statusDimensions, ["routing", "authority", "evidence"])
  assert.deepEqual(contract.branches[0].reasonCodes, {
    routing: ["TASK_UNAVAILABLE", "AGENT_UNAVAILABLE", "SKILL_UNAVAILABLE"],
    authority: ["NETWORK_UNAUTHORIZED", "SOURCE_OUT_OF_SCOPE"],
    evidence: ["BUDGET_MISSING", "EVIDENCE_INSUFFICIENT", "SOURCE_CONFLICT_UNRESOLVED"],
  })
  assert.doesNotMatch(source, /terminal (?:status )?`?BLOCKED`?/i)
})

test("all checked-in package task ledgers describe evidence honestly", async () => {
  for (const name of ["add-curiosity-close-command", "add-curiosity-implement-command", "add-curiosity-ledger-command", "add-curiosity-spec-command", "align-curiosity-bug-command", "align-curiosity-deep-research-command", "align-curiosity-feature-command", "align-curiosity-secure-command", "align-curiosity-verify-command", "unify-curiosity-routing-status"]) {
    const tasks = await read(`openspec/changes/${name}/tasks.md`)
    assert.doesNotMatch(tasks, /does not implement (?:the command|them)/i, name)
    assert.match(tasks, /(?:\[x\].*evidence:|LEGACY_UNKNOWN|BLOCKED:)/i, name)
  }
})
