import assert from "node:assert/strict"
import { lstat, readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const names = ["deliver-change", "bug", "feature", "deep-research", "review", "secure", "verify", "architecture", "spec", "ledger", "implement", "close"]

test("repository constitution declares the exact active surface", async () => {
  const constitution = await read("AGENTS.md")
  assert.match(constitution, /exactly four agents, five composable file-only skills, twelve commands, and one always-applied rule/i)
  assert.doesNotMatch(constitution, /exactly four agents, five composable file-only skills, one command, and one always-applied rule/i)
})

test("command paths are exact, unique, Markdown-only, regular, and non-executable", async () => {
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  const expected = names.map((name) => `commands/curiosity-${name}.md`)
  assert.deepEqual(manifest.commands, expected)
  assert.equal(new Set(manifest.commands).size, 12)
  assert.deepEqual((await readdir(new URL("commands", root))).sort(), expected.map((file) => path.basename(file)).sort())
  for (const file of expected) {
    const stat = await lstat(new URL(file, root))
    assert.ok(stat.isFile() && !stat.isSymbolicLink(), file)
    assert.equal(stat.mode & 0o111, 0, file)
    assert.equal(path.extname(file), ".md", file)
  }
})

test("every command is semantic routing with canonical gates and fail-closed dispatch", async () => {
  for (const name of names) {
    const source = await read(`commands/curiosity-${name}.md`)
    assert.match(source, /^---\ndescription: [^\n]+\n---/, name)
    assert.match(source, /semantic routing prompt/i, name)
    assert.match(source, /not host-enforced/i, name)
    assert.match(source, /canonical (?:authority )?rule|Curiosity Gate/i, name)
    assert.match(source, /BLOCKED_ROUTING/, name)
    assert.match(source, /main (?:must not|does not|never)[^\n]*(?:emulate|perform|substitute)/i, name)
    assert.match(source, /receipt|evidence capsule/i, name)
    assert.match(source, /bounded/i, name)
  }
})

test("commands encode exact specialist and authority contracts", async () => {
  const bug = (await read("commands/curiosity-bug.md")).replaceAll("`", "")
  for (const value of ["symptom", "expected behavior", "built-in Explore", "exactly one curiosity-implementer", "curiosity-implementation-discipline", "curiosity-architecture-awareness", "RED", "competing hypothesis", "discriminating probe", "no blind retry", "fresh curiosity-reviewer", "same-ID", "criterion/evidence map"]) assert.match(bug, new RegExp(value, "i"), value)

  const feature = (await read("commands/curiosity-feature.md")).replaceAll("`", "")
  for (const value of ["PROBE|BOUNDED|ARCHITECTURAL", "built-in Explore", "curiosity-strategist", "curiosity-decision-design", "optional curiosity-researcher", "owner decision", "exactly one curiosity-implementer", "fresh curiosity-reviewer"]) assert.match(feature, new RegExp(value, "i"), value)

  const research = (await read("commands/curiosity-deep-research.md")).replaceAll("`", "")
  for (const value of ["no writes", "curiosity-researcher", "curiosity-research-evidence", "source budget", "taxonomy", "primary sources", "contradictions", "negative results", "one curiosity pass", "NO_GO", "citations", "compressed result"]) assert.match(research, new RegExp(value, "i"), value)
  assert.doesNotMatch(research, /curiosity-implementer/i)

  const review = (await read("commands/curiosity-review.md")).replaceAll("`", "")
  for (const value of ["no writes", "fresh curiosity-reviewer", "curiosity-independent-review", "criteria", "diff", "changed paths", "raw verification evidence", "dual pass", "evidence origins", "attack surface", "no fixes"]) assert.match(review, new RegExp(value, "i"), value)
  assert.doesNotMatch(review, /curiosity-implementer/i)

  const secure = (await read("commands/curiosity-secure.md")).replaceAll("`", "")
  for (const value of ["threat review", "requested fix", "curiosity-strategist", "trust boundary", "optional curiosity-researcher", "current standards", "owner approval", "exactly one curiosity-implementer", "fresh curiosity-reviewer", "security pass", "no network", "ASVS"]) assert.match(secure, new RegExp(value, "i"), value)

  const verify = (await read("commands/curiosity-verify.md")).replaceAll("`", "")
  for (const value of ["main does not run checks", "curiosity-implementer", "verification-only", "no-edit", "project-supported checks", "evidence capsules", "curiosity-reviewer", "read-only permissions", "raw failure", "missing evidence", "UNVERIFIED_SUMMARY"]) assert.match(verify, new RegExp(value, "i"), value)

  const architecture = (await read("commands/curiosity-architecture.md")).replaceAll("`", "")
  for (const value of ["no writes", "curiosity-strategist", "curiosity-decision-design", "optional curiosity-researcher", "owner-decision sweep", "options", "scenarios", "trade-offs", "falsifier", "reversibility", "ADR", "advice", "owner selects"]) assert.match(architecture, new RegExp(value, "i"), value)
  assert.doesNotMatch(architecture, /curiosity-implementer/i)
})

test("live smoke plan covers the current command, lifecycle, fixture, and status inventory", async () => {
  const plan = await read("docs/testing/cursor-live-smoke-plan.md")
  assert.match(plan, /## Twelve-command routing run/)
  for (const name of names) assert.match(plan, new RegExp(`\\/curiosity-${name}\\b`), name)
  for (const name of ["spec", "ledger", "implement", "close"]) assert.match(plan, new RegExp(`\\/curiosity-${name}[^\\n]*`, "i"), `lifecycle ${name}`)
  assert.match(plan, /missing\/unavailable[^\n]*(?:Task)[^\n]*named agent[^\n]*named skill[^\n]*`BLOCKED_ROUTING`/i)
  assert.match(plan, /missing or failed (?:mandatory )?evidence[^\n]*`BLOCKED_EVIDENCE`/i)
  assert.match(plan, /## Nine-fixture behavioral run/)
  for (const fixture of ["blocking-ambiguity", "false-root-cause", "hidden-criterion", "disguised-architecture", "blind-retry", "security-boundary", "context-compression", "direct-main-authority-blocked", "direct-main-authority-successful"]) assert.match(plan, new RegExp(`\\b${fixture}\\b`), fixture)
  assert.match(plan, /exact (?:composer )?readback/i)
  assert.match(plan, /fresh exact (?:Cursor )?window ID/i)
  assert.match(plan, /demo-functional[^\n]*minimal flow/i)
})

test("live smoke canaries distinguish routing from authority blocks", async () => {
  const plan = await read("docs/testing/cursor-live-smoke-plan.md")
  assert.match(plan, /missing\/unavailable[^\n]*(?:Task)[^\n]*named agent[^\n]*named skill[^\n]*`BLOCKED_ROUTING`/i)
  assert.match(plan, /routing succeeds[^\n]*(?:denied\/unavailable)[^\n]*(?:requested action|write permission)[^\n]*`BLOCKED_AUTHORITY`/i)

  const sentences = plan.split(/(?<=[.!?;])\s+|\n+/)
  for (const sentence of sentences.filter((value) => value.includes("BLOCKED_AUTHORITY"))) {
    assert.doesNotMatch(sentence, /(?:missing|unavailable)[^.!?]*(?:Task|dispatch|named agent|named skill)|(?:Task|dispatch|named agent|named skill)[^.!?]*(?:missing|unavailable)/i, sentence)
  }
  for (const sentence of sentences.filter((value) => value.includes("BLOCKED_ROUTING"))) {
    assert.doesNotMatch(sentence, /(?:denied|unavailable)[^.!?]*(?:requested action|write permission)|(?:requested action|write permission)[^.!?]*(?:denied|unavailable)/i, sentence)
  }
})
