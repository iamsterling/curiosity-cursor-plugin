import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { projectNativeWorkflowStatus, validateNativeChangeContract } from "../support/native-change-contract-validator.mjs"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const readContractFixture = async (name) => {
  const fixture = JSON.parse(await read(`tests/fixtures/native-change-contract/${name}.json`))
  if (!fixture.base) return fixture
  return { ...await readContractFixture(fixture.base), ...fixture.override }
}

const required = (source, patterns, label) => {
  for (const pattern of patterns) assert.match(source, pattern, `${label}: ${pattern}`)
}

test("STATIC PROMPT CONTRACT: skill dispatches every action and rejects unknown verbs", async () => {
  const skill = await read("skills/curiosity-engineering/SKILL.md")
  required(skill, [
    /<explore\|propose\|apply\|update\|status\|verify\|finish>/,
    /unknown|missing verb/i,
    /usage[^.]*no edits|no edits[^.]*usage/i,
    /### `explore`[\s\S]*no edits[\s\S]*fact[\s\S]*inference[\s\S]*unknown/i,
    /### `propose`[\s\S]*user[^.]*select[^.]*Plan Mode[\s\S]*risk[\s\S]*explicit[^.]*accept/i,
    /### `apply`[\s\S]*accepted plan[\s\S]*dependencies[\s\S]*ready[\s\S]*blocked/i,
    /### `update`[\s\S]*material[\s\S]*stop edits[\s\S]*(?:renewed|reaccept)/i,
    /### `status`[\s\S]*Todo[^.]*separately[\s\S]*Verification Gate[\s\S]*blocked[\s\S]*unverified/i,
    /### `verify`[\s\S]*completeness[\s\S]*correctness[\s\S]*coherence/i,
    /### `finish`[\s\S]*verify[\s\S]*explicit[^.]*confirmation[\s\S]*never self/i,
  ], "action dispatch")
})

test("STATIC PROMPT CONTRACT: change contract has every normative section and risk profile", async () => {
  const skill = await read("skills/curiosity-engineering/SKILL.md")
  required(skill, [
    /identity[^\n]*intent|intent[^\n]*problem/i,
    /current behavior/i,
    /ADD[\s\S]*CHANGE[\s\S]*REMOVE/,
    /scope[^\n]*non-goals/i,
    /observable requirements/i,
    /happy[^\n]*error[^\n]*edge|happy[\s\S]*error[\s\S]*edge/i,
    /design constraints[^\n]*decisions/i,
    /Todo hierarchy/i,
    /dependencies[\s\S]*blocked reason[\s\S]*unblock condition[\s\S]*evidence/i,
    /rollback/i,
    /unresolved assumptions/i,
    /completion criteria/i,
    /lite profile/i,
    /full (?:behavioral )?(?:contract|profile)/i,
    /security|privacy|auth/i,
    /ambig[^.]*AskQuestion[^.]*stop/i,
    /missing[^.]*scenarios[^.]*full[^.]*unready|full[^.]*missing[^.]*scenarios/i,
  ], "change contract")
})

test("STATIC CONTRACT PROJECTION: valid lite and full fixtures pass", async () => {
  for (const name of ["valid-lite", "valid-full"]) {
    const fixture = await readContractFixture(name)
    assert.deepEqual(validateNativeChangeContract(fixture), [], name)
  }
})

test("VERIFICATION GATE: completed native Todos cannot override failed or missing raw evidence", async () => {
  for (const name of ["todos-complete-evidence-failed", "todos-complete-evidence-missing"]) {
    const projection = projectNativeWorkflowStatus(await readContractFixture(name))
    assert.equal(projection.todoProjection, "All done", name)
    assert.equal(projection.verificationGate, "BLOCKED", name)
    assert.equal(projection.finishConfirmationAllowed, false, name)
    assert.match(projection.statusReport, /All done[\s\S]*BLOCKED[\s\S]*(?:FAIL|MISSING)/, name)
  }
})

test("VERIFICATION GATE: completed native Todos with all mandatory raw evidence passing may allow confirmation", async () => {
  const projection = projectNativeWorkflowStatus(await readContractFixture("todos-complete-evidence-passed"))
  assert.equal(projection.todoProjection, "All done")
  assert.equal(projection.verificationGate, "PASS")
  assert.equal(projection.finishConfirmationAllowed, true)
})

test("STATIC CONTRACT PROJECTION: invalid workflow fixtures are rejected", async () => {
  const negativeFixtures = {
    "full-missing-scenarios": "FULL_SCENARIOS_REQUIRED",
    "blocked-todo-selected": "BLOCKED_TODO_SELECTED",
    "material-drift-without-reacceptance": "MATERIAL_DRIFT_REACCEPTANCE_REQUIRED",
    "ambiguous-status-inferred": "AMBIGUOUS_STATUS_MUST_NOT_BE_INFERRED",
    "finish-without-user-confirmation": "FINISH_REQUIRES_USER_CONFIRMATION",
    "overlapping-parallel-ownership": "PARALLEL_OWNERSHIP_OVERLAP",
    "delegation-without-returned-evidence": "DELEGATION_EVIDENCE_REQUIRED",
    "mandatory-evidence-failed-user-confirmed": "MANDATORY_EVIDENCE_BLOCKS_COMPLETION",
    "material-drift-chat-confirmed": "MATERIAL_DRIFT_NATIVE_PLAN_ACCEPTANCE_REQUIRED",
    "reviewer-handoff-missing-artifacts": "REVIEWER_HANDOFF_ARTIFACTS_REQUIRED",
    "reviewer-handoff-transcript-access": "REVIEWER_TRANSCRIPT_SESSION_ACCESS_PROHIBITED",
  }
  for (const [name, expectedCode] of Object.entries(negativeFixtures)) {
    const fixture = await readContractFixture(name)
    const codes = validateNativeChangeContract(fixture).map(({ code }) => code)
    assert.ok(codes.includes(expectedCode), `${name}: expected ${expectedCode}; received ${codes.join(", ")}`)
  }
})

test("STATIC CONTRACT PROJECTION: native Todo completion is not evidence authority", async () => {
  const fixture = await readContractFixture("failed-evidence-marked-complete")
  const codes = validateNativeChangeContract(fixture).map(({ code }) => code)
  assert.equal(codes.includes("COMPLETE_REQUIRES_PASSING_EVIDENCE"), false)
})

test("STATIC PROMPT CONTRACT: smoke-found completion, drift, and reviewer boundaries are explicit", async () => {
  const [skill, spec, coordinator, reviewer] = await Promise.all([
    read("skills/curiosity-engineering/SKILL.md"),
    read("docs/specs/cursor-native-engineering-workflow.md"),
    read("agents/curiosity-coordinator.md"),
    read("agents/curiosity-reviewer.md"),
  ])
  for (const [label, source] of [["skill", skill], ["spec", spec]]) {
    required(source, [
      /mandatory[\s\S]*PASS\/FAIL\/MISSING[\s\S]*BLOCKED\/UNVERIFIED/i,
      /user confirmation[^.]*cannot[^.]*waive|cannot[^.]*waive[^.]*user confirmation/i,
      /explicit user confirmation[^.]*only[^.]*Verification Gate[^.]*PASS/i,
      /material[^.]*drift[^.]*revised native Plan[^.]*native Plan acceptance/i,
      /chat[^.]*not[^.]*reaccept|chat[^.]*does not[^.]*accept/i,
      /Plan Mode[^.]*acceptance[^.]*unavailable[^.]*blocked|unavailable[^.]*Plan Mode[^.]*blocked/i,
    ], label)
  }
  for (const [label, source] of [["skill", skill], ["spec", spec], ["coordinator", coordinator], ["reviewer", reviewer]]) {
    required(source, [
      /accepted native plan|accepted[^.]*change contract/i,
      /current source/i,
      /diff/i,
      /explicit[^.]*test[^.]*evidence[^.]*output/i,
      /bounded[^.]*task context/i,
      /transcript[^.]*prohibited|must not[^.]*transcript/i,
      /session state[^.]*prohibited|must not[^.]*session state/i,
    ], `${label} reviewer boundary`)
  }
  required(coordinator, [
    /every reviewer Task prompt[^.]*repeat/i,
  ], "coordinator reviewer handoff")
  required(reviewer, [
    /ask the parent[^.]*missing context/i,
  ], "reviewer missing context")
})

test("STATIC PROMPT CONTRACT: native Todos are progress projections and raw evidence owns the Verification Gate", async () => {
  const sources = await Promise.all([
    read("skills/curiosity-engineering/SKILL.md"),
    read("docs/specs/cursor-native-engineering-workflow.md"),
    read("agents/curiosity-coordinator.md"),
    read("agents/curiosity-worker.md"),
    read("agents/curiosity-implementer.md"),
    read("agents/curiosity-reviewer.md"),
  ])
  for (const [index, source] of sources.entries()) {
    required(source, [
      /Todo[^.]*attempted[^.]*progress/i,
      /completed[^.]*All done[^.]*never[^.]*prov/i,
      /raw evidence|raw result|raw (?:command )?output/i,
    ], `Todo authority source ${index}`)
  }
  for (const [label, source] of [["skill", sources[0]], ["spec", sources[1]]]) {
    required(source, [
      /execute <command> and capture exit\/output/i,
      /Verification Gate/i,
      /requirement[^.]*scenario[^.]*evidence command[^.]*PASS\/FAIL\/MISSING/i,
      /FAIL\/MISSING[^.]*BLOCKED\/UNVERIFIED/i,
      /Todo[^.]*separately/i,
      /All done[^.]*failed evidence|failed evidence[^.]*All done/i,
      /confirmation[^.]*only[^.]*Verification Gate[^.]*PASS/i,
    ], label)
  }
})

test("STATIC PROMPT CONTRACT: restoration, collaboration, evidence, and bounds are complete", async () => {
  const skill = await read("skills/curiosity-engineering/SKILL.md")
  required(skill, [
    /Cursor-owned plan[\s\S]*Agent Todos[\s\S]*session[\s\S]*(?:returned )?Task context/i,
    /ask[^.]*ambigu|ambigu[^.]*ask/i,
    /curiosity-worker/,
    /curiosity-implementer/,
    /exact[^.]*Todo/i,
    /exclusive[^.]*file ownership/i,
    /complete child prompt|handoff[^.]*include/i,
    /parent[^.]*coordination[^.]*reconcil/i,
    /raw failures/i,
    /static|prompt-level/i,
    /live-unverified|live[^.]*unverified/i,
    /AskQuestion[^.]*nonblocking|nonblocking[^.]*AskQuestion/i,
    /cannot switch|skill[^.]*not switch/i,
    /skip|cancel/i,
    /do not infer|never infer/i,
    /no plugin-owned (?:state|runtime)/i,
    /not compatible[^.]*OpenSpec|not OpenSpec-compatible/i,
    /not compatible[^.]*Beads|not Beads-compatible/i,
  ], "restoration and bounds")
})

test("STATIC AGENT CONTRACT: writable children are bounded and coordinator reconciles evidence", async () => {
  const worker = await read("agents/curiosity-worker.md")
  const implementer = await read("agents/curiosity-implementer.md")
  const coordinator = await read("agents/curiosity-coordinator.md")
  for (const [name, source] of [["worker", worker], ["implementer", implementer]]) {
    required(source, [
      /readonly: false/,
      /exact[^.]*assigned[^.]*Todo/i,
      /dependencies[^.]*readiness|readiness[^.]*dependencies/i,
      /exclusive[^.]*file ownership/i,
      /acceptance[^.]*evidence/i,
      /no scope expansion|do not expand scope/i,
      /blockers|blocked/i,
      /raw failures|failures/i,
      /no completion authority|do not claim[^.]*completion/i,
      /do not coordinate[^.]*agents|must not coordinate[^.]*agents/i,
    ], name)
  }
  assert.match(implementer, /failing behavior test[^.]*first|test-first/i)
  assert.match(worker, /narrow[^.]*mechanical|mechanical[^.]*bounded/i)
  required(coordinator, [
    /curiosity-worker/,
    /curiosity-implementer/,
    /authorized parallel group/i,
    /exclusive[^.]*ownership/i,
    /dependencies[^.]*readiness/i,
    /overlap/i,
    /reconcil[^.]*evidence/i,
    /failed delegation|delegation failure/i,
    /cannot claim completion|no completion authority/i,
  ], "coordinator")
})

test("STATIC DOCUMENTATION: translation disposition and hook-mesh limitations are durable", async () => {
  const spec = await read("docs/specs/cursor-native-engineering-workflow.md")
  required(spec, [
    /ADOPT/,
    /ADAPT/,
    /REJECT/,
    /DEFER/,
    /gastownhall\/beads[^\n]*v1\.1\.0/i,
    /Fission-AI\/OpenSpec/i,
    /custom[^.]*not compatible[^.]*OpenSpec[^.]*Beads|not compatible with OpenSpec or Beads/i,
    /conversation_id/,
    /generation_id/,
    /workspace_roots/,
    /transcript_path/,
    /do not establish[^.]*correlation/i,
    /transcript parsing[^.]*prohibited/i,
    /hook[^.]*no restoration[^.]*continuation|no stop\/subagentStop hook/i,
    /live-unverified/i,
  ], "translation documentation")
})

test("STATIC PROVENANCE: conceptual source files use immutable revisions and digests", async () => {
  const record = JSON.parse(await read("provenance/cursor/native-change-contract-sources.json"))
  assert.equal(record.retrieved, "2026-08-15")
  assert.deepEqual(new Set(record.sources.map(({ repository, revision }) => `${repository}@${revision}`)), new Set([
    "gastownhall/beads@8e4e59d39f3459a43cf21a3236a13eca4dd874f7",
    "Fission-AI/OpenSpec@d57889664cab4f2f061d236ec3ff82a5578701bb",
  ]))
  for (const source of record.sources) {
    assert.match(source.sha256, /^[a-f0-9]{64}$/)
    assert.ok(source.url.includes(`/${source.revision}/${source.path}`), source.url)
  }
})
