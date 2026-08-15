import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")

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
    /### `status`[\s\S]*complete[\s\S]*active[\s\S]*ready[\s\S]*blocked[\s\S]*unverified/i,
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

test("STATIC PROMPT CONTRACT: negative cases are forbidden explicitly", async () => {
  const skill = await read("skills/curiosity-engineering/SKILL.md")
  const negativeFixtures = [
    ["full-missing-scenarios", /full[^.]*happy[^.]*error[^.]*edge|happy, error, and edge/i],
    ["blocked-todo-selection", /never (?:select|assign|delegate)[^.]*blocked|blocked[^.]*must not be (?:selected|assigned|delegated)/i],
    ["material-drift-without-reacceptance", /material[^.]*stop edits[^.]*reaccept|reaccept[^.]*before[^.]*resum/i],
    ["failed-evidence-marked-complete", /failed evidence[^.]*incomplete|never mark[^.]*complete[^.]*failed/i],
    ["ambiguous-status-inferred", /ambiguous[^.]*status|ambiguous plan[^.]*never inferred/i],
    ["finish-without-confirmation", /without[^.]*explicit[^.]*confirm[^.]*unfinished|never self-confirm/i],
    ["overlapping-parallel-ownership", /parallel[^.]*non-overlapping|no two concurrent[^.]*overlap/i],
    ["delegation-without-evidence", /delegat[^.]*without[^.]*evidence[^.]*unverified|returned evidence[^.]*before/i],
  ]
  for (const [name, pattern] of negativeFixtures) assert.match(skill, pattern, name)
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

test("STATIC DOCUMENTATION: translation disposition and inert-hook limitations are durable", async () => {
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
    /hook[^.]*does not count[^.]*capability/i,
    /live-unverified/i,
  ], "translation documentation")
})
