import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const names = ["deliver-change", "bug", "feature", "deep-research", "review", "secure", "verify", "architecture", "spec", "ledger", "implement", "close"]
const agents = new Set(["curiosity-strategist", "curiosity-reviewer", "curiosity-researcher", "curiosity-implementer"])
const skills = new Set(["curiosity-implementation-discipline", "curiosity-architecture-awareness", "curiosity-decision-design", "curiosity-research-evidence", "curiosity-independent-review"])
const precedence = ["BLOCKED_ROUTING", "BLOCKED_AUTHORITY", "USER_DECISION_REQUIRED", "BLOCKED_EVIDENCE", "DONE"]
const expectedIntents = {
  "deliver-change": ["PROBE", "BOUNDED", "ARCHITECTURAL"],
  bug: ["REPAIR"],
  feature: ["PROBE", "BOUNDED", "ARCHITECTURAL"],
  "deep-research": ["EXTERNAL_DECISION_RESEARCH"],
  review: ["INDEPENDENT_REVIEW"],
  secure: ["THREAT_REVIEW", "TRUST_ARCHITECTURE", "CURRENT_EXTERNAL_FACTS", "AUTHORIZED_FIX"],
  verify: ["VERIFY_ONLY"],
  architecture: ["LOCAL_DECISION", "EXTERNAL_FACT_ASSISTED"],
  spec: ["DRAFT", "PERSIST"],
  ledger: ["SHOW", "CHECKPOINT", "RESUME", "CLOSE"],
  implement: ["APPROVED_CHANGE"],
  close: ["ARCHIVE", "ALREADY_ARCHIVED_IDENTICAL"],
}

const contractFor = async (name) => {
  const source = await read(`commands/curiosity-${name}.md`)
  const match = source.match(/<!-- ROUTE_CONTRACT\n([\s\S]*?)\n-->/)
  assert.ok(match, `${name}: structured route contract`)
  return { source, contract: JSON.parse(match[1]) }
}

test("all twelve commands expose semantic route facts with canonical precedence", async () => {
  for (const name of names) {
    const { contract } = await contractFor(name)
    assert.deepEqual(contract.statusPrecedence, precedence, `${name}: precedence`)
    assert.deepEqual(contract.main, { writes: false, mutatingShell: false, emulatesSpecialists: false }, `${name}: main boundary`)
    assert.deepEqual(contract.branches.map(({ intent }) => intent), expectedIntents[name], `${name}: exact branch set`)
    for (const branch of contract.branches) {
      assert.ok(Number.isInteger(branch.writerCount) && branch.writerCount >= 0 && branch.writerCount <= 1, `${name}/${branch.intent}: writer count`)
      assert.ok(["NONE", "REQUIRED"].includes(branch.ownerGate), `${name}/${branch.intent}: owner gate`)
      assert.ok(["NONE", "FRESH_REVIEWER", "FRESH_REVIEWER_AFTER_WRITE"].includes(branch.review), `${name}/${branch.intent}: review`)
      assert.ok(branch.evidence.length > 0, `${name}/${branch.intent}: evidence`)
      assert.ok(branch.terminalStatuses.every((status) => precedence.includes(status)), `${name}/${branch.intent}: statuses`)
      for (const task of branch.tasks) {
        assert.ok(agents.has(task.agent), `${name}/${branch.intent}: actual agent ${task.agent}`)
        assert.ok(task.skills.length > 0 && task.skills.every((skill) => skills.has(skill)), `${name}/${branch.intent}: actual skills`)
      }
      for (const task of branch.optionalTasks ?? []) {
        assert.ok(agents.has(task.agent), `${name}/${branch.intent}: actual optional agent`)
        assert.ok(task.skills.length > 0 && task.skills.every((skill) => skills.has(skill)), `${name}/${branch.intent}: actual optional skills`)
      }
      assert.equal(branch.tasks.filter(({ agent, invocationMode }) => agent === "curiosity-implementer" && invocationMode === "SPEC_PERSIST_AND_MUTATE").length, branch.writerCount, `${name}/${branch.intent}: writer route`)
    }
  }
})

const validateOptionalResearchRoute = (contract) => {
  const byIntent = Object.fromEntries(contract.branches.map((branch) => [branch.intent, branch]))
  assert.equal(byIntent.PROBE.writerCount, 0)
  assert.deepEqual(byIntent.PROBE.tasks, [])
  assert.deepEqual(byIntent.PROBE.optionalTasks?.map(({ agent }) => agent), ["curiosity-researcher"])
  assert.deepEqual(byIntent.ARCHITECTURAL.tasks.map(({ agent }) => agent), ["curiosity-strategist", "curiosity-implementer", "curiosity-reviewer"])
  assert.deepEqual(byIntent.ARCHITECTURAL.optionalTasks?.map(({ agent }) => agent), ["curiosity-researcher"])
  assert.equal(byIntent.ARCHITECTURAL.optionalTasks[0].when, "DECISION_CHANGING_EXTERNAL_FACTS")
  assert.equal(byIntent.ARCHITECTURAL.optionalTasks[0].network, "EXPLICIT_AUTHORIZATION_REQUIRED")
  assert.equal(byIntent.ARCHITECTURAL.ownerGate, "REQUIRED")
}

test("feature and delivery distinguish probe work from optional external-facts research", async () => {
  for (const name of ["deliver-change", "feature"]) {
    const { source, contract } = await contractFor(name)
    validateOptionalResearchRoute(contract)
    assert.match(source, /researcher[^\n]*optional|optional[^\n]*researcher/i, `${name}: prose optional route`)
  }
})

test("architecture keeps strategist mandatory and external-facts research optional", async () => {
  const { source, contract } = await contractFor("architecture")
  const byIntent = Object.fromEntries(contract.branches.map((branch) => [branch.intent, branch]))
  assert.deepEqual(byIntent.LOCAL_DECISION.tasks.map(({ agent }) => agent), ["curiosity-strategist"])
  assert.equal(byIntent.LOCAL_DECISION.optionalTasks, undefined)
  assert.deepEqual(byIntent.EXTERNAL_FACT_ASSISTED.tasks.map(({ agent }) => agent), ["curiosity-strategist"])
  assert.deepEqual(byIntent.EXTERNAL_FACT_ASSISTED.optionalTasks, [{
    agent: "curiosity-researcher",
    skills: ["curiosity-research-evidence"],
    mode: "read-only",
    when: "DECISION_CHANGING_CURRENT_OR_EXTERNAL_FACTS",
    network: "EXPLICIT_AUTHORIZATION_REQUIRED",
  }])
  assert.match(source, /researcher[^\n]*unavailable[^\n]*must not block[^\n]*strategist-only local architecture/i)
})

test("route mutations cannot make optional research mandatory or bypass the owner gate", async () => {
  for (const name of ["deliver-change", "feature"]) {
    const baseline = structuredClone((await contractFor(name)).contract)
    for (const mutate of [
      (value) => { value.branches.find(({ intent }) => intent === "PROBE").tasks = value.branches.find(({ intent }) => intent === "PROBE").optionalTasks },
      (value) => { delete value.branches.find(({ intent }) => intent === "ARCHITECTURAL").optionalTasks[0].when },
      (value) => { value.branches.find(({ intent }) => intent === "ARCHITECTURAL").tasks.splice(1, 0, value.branches.find(({ intent }) => intent === "ARCHITECTURAL").optionalTasks[0]) },
      (value) => { value.branches.find(({ intent }) => intent === "ARCHITECTURAL").ownerGate = "NONE" },
    ]) {
      const changed = structuredClone(baseline); mutate(changed)
      assert.throws(() => validateOptionalResearchRoute(changed), `${name}: mutation rejected`)
    }
  }
})

const validateResearch = (contract) => {
  const branch = contract.branches[0]
  assert.deepEqual(branch.tasks, [{ agent: "curiosity-researcher", skills: ["curiosity-research-evidence"], mode: "read-only" }])
  assert.equal(branch.network, "EXPLICIT_AUTHORIZATION_REQUIRED")
  assert.deepEqual(branch.budgets, { source: "REQUIRED_NUMERIC_MAX", time: "REQUIRED_BOUNDED" })
  assert.equal(branch.curiosityPass.max, 1)
  assert.equal(branch.parentSynthesis, "COMPRESSED_RECONCILIATION_ONLY")
  assert.deepEqual(branch.statusDimensions, ["routing", "authority", "evidence"])
  assert.deepEqual(branch.output.required, ["claimType", "evidenceOrigin", "confidence", "citationAccessVersionScope", "contradictions", "negativeResults", "decisionVerdict", "evidenceStatus"])
}

const validateSpec = (contract) => {
  assert.equal(contract.intentFlow, "EXTRACT_THEN_CLARIFY_CONSEQUENTIAL_CHOICES_BEFORE_FREEZE")
  assert.deepEqual(contract.draftArtifact, {
    identity: "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN",
    revision: "ZERO_PADDED_MONOTONIC",
    digest: "SHA256_CANONICAL_CONTENT",
    requirements: ["ADDED", "MODIFIED_WHERE_APPLICABLE"],
    scenarios: "GIVEN_WHEN_THEN_PER_REQUIREMENT",
    dependenciesMigrationCompatibility: "REQUIRED_DISPOSITION",
    planTodoTasks: "NON_AUTHORITATIVE_PROJECTION",
    writes: false,
  })
  assert.deepEqual(contract.approval, ["APPROVE <change-id>@rNNNN SHA256:<digest>", "REVISE <change-id>@rNNNN: <changes>", "REJECT <change-id>@rNNNN"])
  assert.equal(contract.branches.find(({ intent }) => intent === "PERSIST").persistence, "IMMUTABLE_SAME_IMPLEMENTER_TASK_BEFORE_MUTATION")
  assert.deepEqual(contract.reasonCodes, {
    routing: ["TASK_UNAVAILABLE", "AGENT_UNAVAILABLE", "SKILL_UNAVAILABLE"],
    owner: ["ASKQUESTION_UNAVAILABLE", "ASKQUESTION_CANCELLED", "CONSEQUENTIAL_CHOICE_UNRESOLVED"],
    evidence: ["PATH_CONFLICT", "PARTIAL_PERSISTENCE", "SPEC_DIGEST_MISMATCH", "SPEC_STALE_OR_MISMATCHED"],
  })
}

const validateClose = (contract) => {
  assert.deepEqual(contract.archiveSemantics, {
    alreadyArchived: "DETECT_BY_EXACT_SOURCE_AND_DESTINATION_STATE",
    repeatedClose: "IDEMPOTENT_STABLE_RESULT",
    sourceDestinationConflict: "USER_DECISION_REQUIRED_NO_OVERWRITE",
    partialMove: "RECOVER_OR_BLOCK_WITH_PATH_EVIDENCE",
    evidenceGate: "BEFORE_ARCHIVE",
  })
}

test("research, spec, and close expose exact critical contracts", async () => {
  validateResearch((await contractFor("deep-research")).contract)
  validateSpec((await contractFor("spec")).contract)
  validateClose((await contractFor("close")).contract)
})

test("critical contract mutations are rejected instead of passing on keywords", async () => {
  const research = structuredClone((await contractFor("deep-research")).contract)
  for (const mutate of [
    (value) => { value.branches[0].tasks[0].agent = "main" },
    (value) => { value.branches[0].tasks[0].skills = [] },
    (value) => { value.branches[0].network = "IMPLICIT" },
    (value) => delete value.branches[0].budgets.source,
    (value) => delete value.branches[0].budgets.time,
    (value) => { value.branches[0].curiosityPass.max = 2 },
    (value) => { value.branches[0].parentSynthesis = "RESEARCH_AGAIN" },
    (value) => { value.branches[0].statusDimensions = ["status"] },
    ...research.branches[0].output.required.map((field) => (value) => { value.branches[0].output.required = value.branches[0].output.required.filter((candidate) => candidate !== field) }),
  ]) {
    const changed = structuredClone(research); mutate(changed)
    assert.throws(() => validateResearch(changed))
  }

  const spec = structuredClone((await contractFor("spec")).contract)
  for (const mutate of [
    (value) => { value.intentFlow = "FREEZE_BEFORE_CLARIFY" },
    (value) => { value.draftArtifact.identity = "UNSTABLE" },
    (value) => { delete value.draftArtifact.revision },
    (value) => { delete value.draftArtifact.digest },
    (value) => { value.draftArtifact.requirements = ["ADDED"] },
    (value) => { value.draftArtifact.scenarios = "EXAMPLES" },
    (value) => { value.draftArtifact.writes = true },
    (value) => { value.approval[0] = "APPROVE" },
    (value) => { value.approval[1] = "REVISE" },
    (value) => { value.approval[2] = "REJECT" },
    (value) => { value.branches[1].persistence = "MAIN_ALLOWED" },
    (value) => { delete value.reasonCodes.owner },
  ]) {
    const changed = structuredClone(spec); mutate(changed)
    assert.throws(() => validateSpec(changed))
  }

  const close = structuredClone((await contractFor("close")).contract)
  for (const field of Object.keys(close.archiveSemantics ?? { missing: true })) {
    const changed = structuredClone(close); delete changed.archiveSemantics[field]
    assert.throws(() => validateClose(changed))
  }
})

test("strict read-only and lifecycle writer routes are structurally enforced", async () => {
  for (const name of ["deep-research", "review", "architecture"]) {
    const { contract } = await contractFor(name)
    assert.ok(contract.branches.every(({ writerCount, tasks }) => writerCount === 0 && tasks.every(({ agent }) => agent !== "curiosity-implementer")), name)
  }

  const spec = (await contractFor("spec")).contract
  assert.equal(spec.branches.find(({ intent }) => intent === "DRAFT").writerCount, 0)
  assert.equal(spec.branches.find(({ intent }) => intent === "PERSIST").writerCount, 1)

  const ledger = (await contractFor("ledger")).contract
  assert.equal(ledger.branches.find(({ intent }) => intent === "SHOW").writerCount, 0)
  for (const intent of ["CHECKPOINT", "RESUME", "CLOSE"]) assert.equal(ledger.branches.find((branch) => branch.intent === intent).writerCount, 1)

  for (const name of ["implement", "bug", "feature", "close"]) {
    const { contract } = await contractFor(name)
    assert.ok(contract.branches.some(({ writerCount }) => writerCount === 1), name)
  }
  const verify = (await contractFor("verify")).contract
  assert.ok(verify.branches.every(({ writerCount, tasks }) => writerCount === 0 && tasks.some(({ agent, invocationMode }) => agent === "curiosity-implementer" && invocationMode === "VERIFICATION_ONLY")))
})

test("security branches separate routine review, trust decisions, research, and authorized fixes", async () => {
  const { contract } = await contractFor("secure")
  const byIntent = Object.fromEntries(contract.branches.map((branch) => [branch.intent, branch]))
  assert.deepEqual(byIntent.THREAT_REVIEW.tasks.map(({ agent }) => agent), ["curiosity-reviewer"])
  assert.deepEqual(byIntent.TRUST_ARCHITECTURE.tasks.map(({ agent }) => agent), ["curiosity-strategist"])
  assert.deepEqual(byIntent.CURRENT_EXTERNAL_FACTS.tasks.map(({ agent }) => agent), ["curiosity-researcher"])
  assert.equal(byIntent.CURRENT_EXTERNAL_FACTS.network, "EXPLICIT_AUTHORIZATION_REQUIRED")
  assert.equal(byIntent.AUTHORIZED_FIX.writerCount, 1)
  assert.equal(byIntent.AUTHORIZED_FIX.review, "FRESH_REVIEWER_AFTER_WRITE")
})

test("status meanings are non-overlapping in the always-applied rule", async () => {
  const rule = await read("rules/curiosity-delivery.mdc")
  assert.match(rule, /BLOCKED_ROUTING[^\n]*only[^\n]*(?:Task|agent|skill)/i)
  assert.match(rule, /BLOCKED_AUTHORITY[^\n]*only after routing succeeds/i)
  assert.match(rule, /USER_DECISION_REQUIRED[^\n]*consequential owner/i)
  assert.match(rule, /BLOCKED_EVIDENCE[^\n]*(?:missing|failed)[^\n]*mandatory evidence/i)
  assert.match(rule, /DONE[^\n]*only after[^\n]*(?:criteria|gates)/i)
  assert.doesNotMatch(rule, /require `BLOCKED`|`BLOCKED` or/i)
  assert.match(rule, /`BLOCKED` is only a non-terminal receipt stop reason; it is never a terminal workflow status/i)
})

test("branch statuses agree exactly with owner gates and route-wide owner stops", async () => {
  const routeWideOwnerStops = new Set(["deep-research", "ledger", "implement", "close"])
  for (const name of names) {
    const { source, contract } = await contractFor(name)
    for (const branch of contract.branches) {
      if (name === "close" && branch.intent === "ALREADY_ARCHIVED_IDENTICAL") {
        assert.deepEqual(branch.terminalStatuses, ["BLOCKED_EVIDENCE", "DONE"])
        continue
      }
      const expected = ["BLOCKED_ROUTING", "BLOCKED_AUTHORITY"]
      if (branch.ownerGate === "REQUIRED" || routeWideOwnerStops.has(name)) expected.push("USER_DECISION_REQUIRED")
      expected.push("BLOCKED_EVIDENCE", "DONE")
      assert.deepEqual(branch.terminalStatuses, expected, `${name}/${branch.intent}: exact allowed statuses`)
    }
    if (routeWideOwnerStops.has(name)) assert.match(source, /`USER_DECISION_REQUIRED`/, `${name}: prose owner stop`)
  }
})

test("ten planning packages remain compatibility inputs pending governance", async () => {
  const packages = (await readdir(new URL("openspec/changes/", root), { withFileTypes: true })).filter((entry) => entry.isDirectory())
  assert.equal(packages.length, 10)
  const governance = `${await read("docs/decisions/0032-file-only-change-lifecycle.md")}\n${await read("docs/migration/0.8.0-change-lifecycle.md")}`
  assert.match(governance, /constitution says OpenSpec is not adopted/i)
  assert.match(governance, /OpenSpec-compatible[^]*non-runtime planning/i)
  assert.match(governance, /OWNER DECISION REQUIRED|unresolved decision/i)
  assert.match(governance, /Do not modify `AGENTS\.md`|silently modify `AGENTS\.md`/i)
})
