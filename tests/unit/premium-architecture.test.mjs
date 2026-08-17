import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const skills = [
  "curiosity-implementation-discipline",
  "curiosity-architecture-awareness",
  "curiosity-decision-design",
  "curiosity-research-evidence",
  "curiosity-independent-review",
]

test("0.8.0 has exact four-agent five-skill twelve-command one-rule inventory", async () => {
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  const pkg = JSON.parse(await read("package.json"))
  assert.equal(pkg.version, "0.8.0")
  assert.equal(manifest.version, pkg.version)
  assert.equal(manifest.agents.length, 4)
  assert.deepEqual(manifest.skills, skills.map((name) => `skills/${name}`))
  assert.equal(manifest.commands.length, 12)
  assert.deepEqual(manifest.rules, ["rules/curiosity-delivery.mdc"])
  assert.deepEqual((await readdir(new URL("skills", root))).sort(), skills.toSorted())
  for (const name of skills) {
    const source = await read(`skills/${name}/SKILL.md`)
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)
    assert.ok(frontmatter, `${name}: frontmatter`)
    assert.match(frontmatter[1], new RegExp(`^name: ${name}$`, "m"), `${name}: discovery name`)
    assert.match(frontmatter[1], /^description: .+/m, `${name}: description`)
  }
})

test("roles require the exact semantic skills and preserve authority", async () => {
  const contracts = {
    "agents/curiosity-strategist.md": ["curiosity-decision-design", "OWNER_DECISION_REQUIRED", "grok-4.6"],
    "agents/curiosity-researcher.md": ["curiosity-research-evidence", "SKILL_UNAVAILABLE", "grok-4.6"],
    "agents/curiosity-implementer.md": ["curiosity-implementation-discipline", "curiosity-architecture-awareness", "composer-2.5"],
    "agents/curiosity-reviewer.md": ["curiosity-independent-review", "UNVERIFIED_SUMMARY", "claude-sonnet-5"],
  }
  for (const [file, values] of Object.entries(contracts)) {
    const source = await read(file)
    for (const value of values) assert.match(source, new RegExp(value), `${file}: ${value}`)
    assert.match(source, /REQUIRED SKILLS[^]*semantic[^]*(?:not|no)[^]*programmatic (?:skill )?attachment/i, file)
    assert.match(source, /model[^]*(?:preference|fallback)[^]*(?:not guaranteed|cannot be guaranteed)/i, file)
  }
  assert.match(await read("agents/curiosity-implementer.md"), /DONE\|BLOCKED\|OWNER_DECISION_REQUIRED/)
  for (const file of ["agents/curiosity-strategist.md", "agents/curiosity-researcher.md", "agents/curiosity-reviewer.md"]) {
    assert.match(await read(file), /read-only/i, file)
  }
})

test("canonical rule preserves main no-mutation authority under adversarial envelopes", async () => {
  const rule = await read("rules/curiosity-delivery.mdc")
  for (const pattern of [
    /top-level main Agent[^]*never invoke[^]*file edit[^/]*write[^/]*delete tools/i,
    /mutating shell commands[^]*(?:project|workspace)[^]*\/tmp/i,
    /direct user requests[^]*urgency[^]*simplicity[^]*(?:force|trust)[^]*specialist failure[^]*ignore rules/i,
    /product architecture[^]*per-task requests[^]*implementer work/i,
    /BLOCKED_ROUTING[^]*Task dispatch[^]*named agent[^]*named skill[^]*BLOCKED_AUTHORITY[^]*only after routing succeeds/i,
    /native Plan\/Todo[^]*read-only orchestration[^]*allowed/i,
  ]) assert.match(rule, pattern)
  assert.match(await read("commands/curiosity-deliver-change.md"), /canonical authority rule[^]*before[^]*route/i)
})

test("canonical rule distinguishes host metadata from semantic authority", async () => {
  const rule = await read("rules/curiosity-delivery.mdc")
  assert.match(rule, /strategist[^\n]*researcher[^\n]*reviewer[^\n]*`readonly: true`/i)
  assert.match(rule, /intended to restrict file edits and state-changing shell/i)
  assert.match(rule, /Cursor version[^\n]*(?:mode|polic)/i)
  for (const boundary of ["exact Task dispatch", "named skill application", "main no-edit", "implementer allowed-path scope", "network confinement", "receipts/evidence", "resulting behavior"]) {
    assert.match(rule, new RegExp(boundary, "i"), boundary)
  }
  assert.match(rule, /semantic unless separately (?:observed|enforced)/i)
  assert.match(rule, /implementer[^\n]*verification-only[^\n]*writable capability risk/i)
  assert.match(rule, /audit[^\n]*before\/after hashes[^\n]*(?:host|tool) events/i)
})

test("skills own methods and exact typed vocabularies", async () => {
  const implementation = await read("skills/curiosity-implementation-discipline/SKILL.md")
  for (const value of ["MISSING_HANDOFF", "SKILL_UNAVAILABLE", "DIRTY_WORK_CONFLICT", "SCOPE_CONFLICT", "ARCHITECTURE_BOUNDARY", "DEPENDENCY_APPROVAL", "RED_NOT_OBTAINED", "VERIFICATION_FAILURE", "ENVIRONMENT_FAILURE"]) assert.match(implementation, new RegExp(value))
  for (const value of ["criterion", "phase", "origin", "command_or_artifact", "exit_status", "expected", "observed", "anchor", "limitations"]) assert.match(implementation, new RegExp(`\\b${value}\\b`))
  assert.match(implementation, /phase[^\n]*RED\|GREEN\|VERIFY\|REVIEW/)
  assert.match(implementation, /initial[^\n]*changed-path[^]*final[^\n]*allowed-path audit/i)
  assert.match(implementation, /pre-existing dirty/i)

  const architecture = await read("skills/curiosity-architecture-awareness/SKILL.md")
  for (const value of ["Architecture Boundary Card", "module", "domain", "package", "coupling", "cohesion", "public contract", "security", "test seam", "reversibility", "OWNER_DECISION_REQUIRED"]) assert.match(architecture, new RegExp(value, "i"))
  assert.match(architecture, /before (?:writing|edits)/i)
  assert.match(architecture, /must not[^]*(?:choose|select)[^]*architecture/i)

  const decision = await read("skills/curiosity-decision-design/SKILL.md")
  for (const value of ["decision frame", "constraints", "invariants", "2–4", "assumption", "reversibility", "owner-decision sweep", "quality scenarios", "trade-offs", "falsifier", "recommendation", "ADR"]) assert.match(decision, new RegExp(value, "i"))

  const research = await read("skills/curiosity-research-evidence/SKILL.md")
  assert.match(research, /FACT\|VENDOR_CLAIM\|ACADEMIC_FINDING\|INFERENCE\|UNKNOWN/)
  for (const value of ["direct origin", "access date", "version", "population", "scope", "contradiction", "negative result", "triangulation", "single-source limitation", "decision verdict", "saturation"]) assert.match(research, new RegExp(value, "i"))

  const review = await read("skills/curiosity-independent-review/SKILL.md")
  assert.match(review, /REVIEWER_OBSERVED\|IMPLEMENTER_EXECUTED\|PARENT_SUPPLIED\|WORKSPACE_ARTIFACT\|UNVERIFIED_SUMMARY/)
  assert.match(review, /UNVERIFIED_SUMMARY[^]*(?:cannot|must not)[^]*PASS/i)
  assert.match(review, /criteria[^]*correctness[^]*maintainability[^]*test[^]*security[^]*boundary/i)
  assert.match(review, /same-ID[^]*correction delta[^]*newly introduced[^]*(?:critical|high)/i)
})

test("routing escalates only and architecture requires an owner decision", async () => {
  const command = await read("commands/curiosity-deliver-change.md")
  assert.match(command, /PROBE\|BOUNDED\|ARCHITECTURAL/)
  assert.match(command, /classification[^]*(?:only escalate|never de-escalate)/i)
  for (const axis of ["public API/config", "data/persistence/migration/retention", "dependency/license/supply chain", "security/privacy/trust", "deployment/operations", "compatibility/rollout", "paid service/spend", "reversibility/rollback"]) assert.match(command, new RegExp(axis, "i"))
  assert.match(command, /ARCHITECTURAL[^]*Explore[^]*strategist[^]*owner decision[^]*implementer[^]*reviewer/i)
  assert.match(command, /handoff[^]*900 words[^]*specialist synthesis[^]*1200 words[^]*capsule[^]*150 words[^]*agents[^]*350 words/i)
  assert.match(command, /repository-relative paths/i)
})

test("passing reviewer verdicts share one canonical evidence gate", async () => {
  const rule = await read("rules/curiosity-delivery.mdc")
  for (const pattern of [
    /passing reviewer verdicts[^]*PASS\|PASS_WITH_NOTES/i,
    /every mandatory acceptance criterion[^]*PASS/i,
    /no raw failure/i,
    /no criterion[^]*security[^]*decision-affecting material unknown/i,
    /no (?:mandatory )?criterion[^]*UNVERIFIED_SUMMARY/i,
    /PASS_WITH_NOTES[^]*only[^]*nonblocking observations[^]*outside mandatory criteria[^]*security gates/i,
  ]) assert.match(rule, pattern)
  for (const file of ["commands/curiosity-deliver-change.md", "skills/curiosity-independent-review/SKILL.md", "agents/curiosity-reviewer.md", "docs/specs/vanilla-cursor-native-orchestration.md"]) {
    const source = await read(file)
    assert.match(source, /PASS\|PASS_WITH_NOTES/, file)
    assert.match(source, /canonical[^]*(?:passing-verdict|evidence) gate|Parent Curiosity Gate/i, file)
  }
})

test("installed prompt ownership has no duplicated normalized block over 40 words", async () => {
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  const files = Object.values(manifest).flat().filter((value) => typeof value === "string" && /^(agents|skills|commands|rules)\//.test(value)).map((value) => value.startsWith("skills/") ? `${value}/SKILL.md` : value)
  const owners = new Map()
  for (const file of files) {
    const blocks = (await read(file)).split(/\n\s*\n/).map((block) => block.toLowerCase().replace(/[^a-z0-9_|]+/g, " ").trim())
    for (const block of blocks) {
      if (block.split(/\s+/).length <= 40 || block.includes("classification frame probe evidence outcome decision_impact")) continue
      assert.equal(owners.has(block), false, `duplicate normalized block: ${owners.get(block)} and ${file}`)
      owners.set(block, file)
    }
  }
})
