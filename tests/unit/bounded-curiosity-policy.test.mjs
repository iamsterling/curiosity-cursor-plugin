import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { assessReceipt, isBlindRetry, receiptFields } from "../support/bounded-curiosity-policy.mjs"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const readJson = async (file) => JSON.parse(await read(file))
const installed = [
  "rules/curiosity-delivery.mdc",
  "commands/curiosity-deliver-change.md",
  "skills/curiosity-implementation-discipline/SKILL.md",
  "agents/curiosity-researcher.md",
  "agents/curiosity-strategist.md",
  "agents/curiosity-reviewer.md",
  "agents/curiosity-implementer.md",
]
const currentDocs = [
  "README.md", "AGENTS.md", "CHANGELOG.md", "docs/architecture/README.md",
  "docs/architecture/current-state.md", "docs/installation-architecture.md",
  "docs/decisions/0029-bounded-curiosity-as-foundational-policy.md",
  "docs/migration/0.5.0-cursor-only.md", "docs/provenance.md",
  "docs/provenance/README.md", "docs/research/README.md",
  "docs/specs/vanilla-cursor-native-orchestration.md", "docs/testing/cursor-live-smoke-plan.md",
]

test("canonical rule owns the exact receipt contract and curiosity gate", async () => {
  const rule = await read("rules/curiosity-delivery.mdc")
  const positions = receiptFields.map((field) => rule.indexOf(`\`${field}\``))
  assert.ok(positions.every((position) => position >= 0), "all receipt fields must exist")
  assert.deepEqual(positions, positions.toSorted((a, b) => a - b), "receipt fields must be ordered")
  for (const pattern of [
    /SUBSTANTIVE[^]*recommends[^]*root-cause[^]*next workflow step/i,
    /TRIVIAL[^]*deterministic retrieval[^]*uncertainty[^]*SUBSTANTIVE/i,
    /180 words/i, /10 logical field lines/i, /at most 3[^\n]*CURIOSITY_NO_GO/i,
    /negative evidence/i, /reproducible anchors/i, /material_unknowns: none[^]*affirmative claim/i,
    /missing[^]*malformed[^]*weak[^]*same child ID[^]*one bounded[^\n]*repair/i,
    /raw evidence controls[^]*same ID[^]*reconciliation/i,
    /two-claim evidence map[^]*one bounded discriminating probe/i,
    /criterion[^]*security[^]*dependency[^]*irreversible[^]*review[^]*BLOCKED[^]*USER_DECISION_REQUIRED/i,
    /reversible[^]*out-of-criteria[^]*recorded consequence[^]*validation[^]*rollback/i,
    /PASS[^]*material unknown[^]*raw failure[^]*same reviewer/i,
    /twice-?inadequate[^]*BLOCKED[^]*preferred answer/i,
    /declared handoff authority[^]*(?:no autonomous|starts an autonomous)/i,
    /semantic[^]*not[^]*host[^]*(?:validator|hook|state store)/i,
  ]) assert.match(rule, pattern)

  const completeSchema = receiptFields.map((field) => `\`${field}\``).join(", ")
  assert.equal(rule.includes(completeSchema), true, "canonical rule contains one complete schema")
  for (const file of [...installed.slice(1), ...currentDocs]) {
    const source = await read(file)
    assert.equal(source.includes(completeSchema), false, `${file} duplicates inline schema`)
    assert.equal(receiptFields.every((field) => source.includes(`\`${field}\``)), false, `${file} duplicates full schema in another format`)
  }
})

test("test-only receipt examples reject deleted fields and PASS with unknowns", () => {
  const receipt = Object.fromEntries(receiptFields.map((field) => [field, "value"]))
  Object.assign(receipt, { classification: "SUBSTANTIVE", outcome: "SUPPORTED", decision_impact: "UNCHANGED", material_unknowns: "none", curiosity_pass: "PASS", stop_reason: "COVERAGE" })
  assert.equal(assessReceipt(receipt), "ACCEPT")
  const missing = { ...receipt }
  delete missing.probe
  assert.equal(assessReceipt(missing), "MALFORMED")
  assert.equal(assessReceipt({ ...receipt, material_unknowns: "dependency version unverified" }), "REJECT")
})

test("researcher alone owns exact score formula and bounded candidate policy", async () => {
  const researcher = await read("agents/curiosity-researcher.md")
  for (const pattern of [
    /R[^\n]*relevance[^\n]*0[^\n]*3/i, /V[^\n]*decision value[^\n]*0[^\n]*3/i,
    /N[^\n]*novelty[^\n]*0[^\n]*3/i, /I[^\n]*inverse cost[^\n]*0[^\n]*3/i,
    /S = 0\.35R \+ 0\.35V \+ 0\.15N \+ 0\.15I/,
    /exactly one[^\n]*highest/i, /S >= 2\.0/, /R >= 2/, /V >= 2/,
    /authority[^\n]*budget/i, /Tie[^\n]*V[^\n]*R[^\n]*I[^\n]*enumeration/i,
    /CURIOSITY_NO_GO/i, /SATURATION[^\n]*two suitable probes[^\n]*no decision-changing evidence/i,
    /COVERAGE/, /EXHAUSTION/, /BLOCKED/, /sources[^\n]*contradictions[^\n]*negative results/i,
    /receipt[^\n]*shared[^\n]*curiosity-delivery|shared[^\n]*curiosity-delivery[^\n]*receipt/i,
  ]) assert.match(researcher, pattern)
  const formula = "S = 0.35R + 0.35V + 0.15N + 0.15I"
  assert.equal(researcher.split(formula).length - 1, 1)
  for (const file of [...installed.filter((file) => !file.endsWith("curiosity-researcher.md")), ...currentDocs]) assert.equal((await read(file)).includes(formula), false, `${file} duplicates formula`)
})

test("all specialists apply the shared receipt with bounded role-specific curiosity", async () => {
  for (const file of installed.filter((file) => file.startsWith("agents/"))) {
    const source = await read(file)
    assert.match(source, /every substantive[^\n]*CURIOSITY_RECEIPT|CURIOSITY_RECEIPT[^\n]*every substantive/i, file)
    assert.match(source, /shared[^\n]*rules\/curiosity-delivery\.mdc|shared[^\n]*curiosity-delivery rule/i, file)
  }
  const strategist = await read("agents/curiosity-strategist.md")
  for (const pattern of [/highest-impact assumption/i, /strongest credible alternative|failure scenario/i, /measurable quality scenario/i, /sensitivity|second-order/i, /change or withdraw|withdraw[^\n]*recommendation/i]) assert.match(strategist, pattern)
  const reviewer = await read("agents/curiosity-reviewer.md")
  for (const pattern of [/highest-consequence acceptance claim/i, /counterexample|boundary|caller|interface|evidence-integrity/i, /proven defect[^\n]*missing evidence/i, /asset[^\n]*trust boundary[^\n]*attacker[^\n]*abuse case[^\n]*mitigation[^\n]*verification/i, /PASS[^\n]*receipt/i, /same reviewer[^\n]*causal class/i]) assert.match(reviewer, pattern)
  const implementer = await read("agents/curiosity-implementer.md")
  for (const pattern of [/falsifiable root-cause hypothesis/i, /competing explanation/i, /discriminating observation/i, /focused(?: RED)? behavior test/i, /update or retire|retire[^\n]*hypothesis/i, /change strategy/i, /blind retry/i]) assert.match(implementer, pattern)
})

test("implementation policy identifies blind retry and requires changed strategy", async () => {
  const skill = await read("skills/curiosity-implementation-discipline/SKILL.md")
  for (const pattern of [/blind retry/i, /materially same command or patch/i, /changed evidence[^\n]*hypothesis[^\n]*input[^\n]*environment[^\n]*diagnostic purpose/i, /update or retire|retire[^\n]*hypothesis/i, /change strategy/i, /shared[^\n]*curiosity-delivery[^\n]*rule/i]) assert.match(skill, pattern)
  const fixtures = await readJson("tests/fixtures/bounded-curiosity-retries.json")
  for (const fixture of fixtures.blindRetries) assert.equal(isBlindRetry(fixture.previous, fixture.next), true, fixture.name)

  const baseline = fixtures.blindRetries[0].previous
  for (const [field, value] of fixtures.justifiedRetries) {
    assert.equal(isBlindRetry(baseline, { ...baseline, [field]: value }), false, `changed ${field} justifies retry`)
  }

  const unchangedPatch = fixtures.blindRetries.find(({ previous }) => previous.kind === "patch")
  assert.equal(isBlindRetry(unchangedPatch.previous, { ...unchangedPatch.previous }), true, "unchanged patch is blind")
  assert.equal(isBlindRetry(baseline, { ...baseline, command: "bun test tests/unit/other.test.mjs" }), false, "changed command input is material")
  assert.match(await read("tests/support/bounded-curiosity-policy.mjs"), /authored policy examples[^]*not live host behavior/i)
})

test("installed implementation policy requires executed intended RED before behavior edits", async () => {
  const policyFiles = [
    "rules/curiosity-delivery.mdc",
    "commands/curiosity-deliver-change.md",
    "skills/curiosity-implementation-discipline/SKILL.md",
    "agents/curiosity-implementer.md",
  ]
  for (const file of policyFiles) {
    const source = await read(file)
    assert.match(source, /before any behavior edit[^]*add[^]*execute[^]*focused behavior test[^]*fails? for the intended reason/i, file)
    assert.match(source, /characterization[^]*(?:is not|does not count as)[^]*RED|unrelated failures?[^]*(?:is not|do not count as)[^]*RED/i, file)
    assert.match(source, /probe[^]*supplement[^]*(?:substitute|instead)[^]*(?:non-behavior|documentation)[^]*(?:infeasible|exception)/i, file)
    assert.match(source, /(?:stop|BLOCKED)[^]*(?:escalate|ask)|user-authorized exception/i, file)
  }
})

test("command applies Curiosity Gate before progress and preserves review accounting", async () => {
  const command = await read("commands/curiosity-deliver-change.md")
  for (const pattern of [
    /Curiosity Gate/i, /including[^\n]*Explore|Explore[^\n]*every substantive/i,
    /missing[^\n]*malformed[^\n]*weak[^]*no Todo[^\n]*phase advancement/i,
    /resume[^\n]*same child ID[^\n]*one bounded repair/i,
    /contradiction[^\n]*raw evidence controls/i, /two-claim evidence map/i, /discriminating probe/i,
    /material unknown[^\n]*(?:BLOCKED|USER_DECISION_REQUIRED)/i,
    /PASS[^\n]*material unknown|material unknown[^\n]*PASS/i, /same reviewer/i,
    /twice inadequate[^\n]*BLOCKED/i, /do not replace[^\n]*preferred answer/i,
    /receipt-only repair[^\n]*(?:does not consume|consumes no)[^\n]*review cycle/i,
    /BLOCKED|CHANGES_REQUIRED/, /does consume[^\n]*cycle/i,
    /changed hypothesis|new evidence/i, /no blind retry/i,
    /second blocked review[^\n]*terminates/i, /no third cycle|cannot authorize[^\n]*third/i,
    /no autonomous|never creates an autonomous/i,
  ]) assert.match(command, pattern)
})

test("current documentation records foundational policy, ADR rationale, and semantic smoke scenarios", async () => {
  const adr = await read("docs/decisions/0029-bounded-curiosity-as-foundational-policy.md")
  for (const pattern of [/Status:\*{0,2}\s*Accepted/i, /foundational policy/i, /decision value/i, /falsification/i, /ATAM/i, /NIST/i, /OWASP/i, /reproducib/i, /heuristic adaptation/i, /2026-08-16/, /https:\/\//]) assert.match(adr, pattern)
  const spec = await read("docs/specs/vanilla-cursor-native-orchestration.md")
  assert.match(spec, /Conformance/i)
  assert.match(spec, /rules\/curiosity-delivery\.mdc/)
  const smoke = await read("docs/testing/cursor-live-smoke-plan.md")
  for (const pattern of [
    /missing receipt[^\n]*same-ID repair/i, /strict trivial[^\n]*substantive/i, /weak receipt/i,
    /child contradiction[^\n]*evidence map/i, /PASS[^\n]*material unknown[^\n]*rejected/i,
    /researcher[^\n]*top candidate[^\n]*NO_GO/i, /implementer[^\n]*blind retry[^\n]*strategy change/i,
    /strategist[^\n]*reversal/i, /same IDs/i, /cycle cap/i, /receipt compactness/i,
    /SEMANTIC/, /DECLARATIVE/, /HOST-OBSERVED/, /HOST-ENFORCED/,
  ]) assert.match(smoke, pattern)
})
