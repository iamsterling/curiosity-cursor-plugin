import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { assessReceipt, isBlindRetry, receiptFields } from "../support/bounded-curiosity-policy.mjs"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")

const installed = [
  "rules/curiosity-delivery.mdc", "commands/curiosity-deliver-change.md",
  "agents/curiosity-researcher.md", "agents/curiosity-strategist.md",
  "agents/curiosity-reviewer.md", "agents/curiosity-implementer.md",
]

test("canonical rule solely owns receipt schema and curiosity gate", async () => {
  const rule = await read(installed[0])
  const complete = receiptFields.map((field) => `\`${field}\``).join(", ")
  assert.equal(rule.includes(complete), true)
  for (const pattern of [/SUBSTANTIVE/, /TRIVIAL/, /180 words/i, /CURIOSITY_NO_GO/, /negative evidence/i, /same child ID/i, /raw evidence controls/i, /USER_DECISION_REQUIRED/, /no autonomous/i]) assert.match(rule, pattern)
  for (const file of installed.slice(1)) assert.equal((await read(file)).includes(complete), false, file)
})

test("test-only receipt examples reject deleted fields and PASS with unknowns", () => {
  const receipt = Object.fromEntries(receiptFields.map((field) => [field, "value"]))
  Object.assign(receipt, { classification: "SUBSTANTIVE", outcome: "SUPPORTED", decision_impact: "UNCHANGED", material_unknowns: "none", curiosity_pass: "PASS", stop_reason: "COVERAGE" })
  assert.equal(assessReceipt(receipt), "ACCEPT")
  const missing = { ...receipt }; delete missing.probe
  assert.equal(assessReceipt(missing), "MALFORMED")
  assert.equal(assessReceipt({ ...receipt, material_unknowns: "dependency version unverified" }), "REJECT")
})

test("implementation skill preserves scientific debugging and strict RED", async () => {
  const skill = await read("skills/curiosity-implementation-discipline/SKILL.md")
  for (const pattern of [/falsifiable root-cause/i, /competing explanation/i, /discriminating observation/i, /blind retry/i, /changed evidence, hypothesis, input, environment, or diagnostic purpose/i, /update or retire/i, /change strategy/i, /focused intended RED/i, /characterization[^.]*not RED/i, /never weaken a test/i]) assert.match(skill, pattern)
  const fixtures = JSON.parse(await read("tests/fixtures/bounded-curiosity-retries.json"))
  for (const fixture of fixtures.blindRetries) assert.equal(isBlindRetry(fixture.previous, fixture.next), true, fixture.name)
  const baseline = fixtures.blindRetries[0].previous
  for (const [field, value] of fixtures.justifiedRetries) assert.equal(isBlindRetry(baseline, { ...baseline, [field]: value }), false, field)
})

test("all roles preserve bounded curiosity and shared receipt reference", async () => {
  for (const file of installed.filter((value) => value.startsWith("agents/"))) {
    const source = await read(file)
    assert.match(source, /every substantive result|Every substantive result/i, file)
    assert.match(source, /CURIOSITY_RECEIPT/, file)
  }
  assert.match(await read("agents/curiosity-researcher.md"), /bounded saturation[^]*CURIOSITY_NO_GO/i)
  assert.match(await read("agents/curiosity-strategist.md"), /falsifier\/reversal/i)
  assert.match(await read("agents/curiosity-reviewer.md"), /same reviewer ID|same-ID/i)
})

test("command preserves same IDs, evidence precedence, and two-cycle cap", async () => {
  const command = await read("commands/curiosity-deliver-change.md")
  for (const pattern of [/Curiosity Gate/i, /same implementer ID/i, /same reviewer ID/i, /fresh reviewer/i, /maximum two review cycles/i, /no third cycle/i, /receipt-only repair does not consume/i, /raw evidence/i, /Todo state never overrides/i, /one bounded discriminating probe/i, /no autonomous loop/i]) assert.match(command, pattern)
})
