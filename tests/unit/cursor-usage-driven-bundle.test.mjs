import assert from "node:assert/strict"
import { lstat, readdir, readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import Ajv from "ajv"
import { parseDocument } from "yaml"
import { validateCursorUsageAggregate } from "../support/cursor-usage-aggregate-validator.mjs"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const expected = {
  agents: ["agents/curiosity-strategist.md", "agents/curiosity-reviewer.md", "agents/curiosity-researcher.md", "agents/curiosity-implementer.md"],
  skills: ["skills/curiosity-implementation-discipline", "skills/curiosity-architecture-awareness", "skills/curiosity-decision-design", "skills/curiosity-research-evidence", "skills/curiosity-independent-review"],
  commands: [
    "commands/curiosity-deliver-change.md",
    "commands/curiosity-bug.md",
    "commands/curiosity-feature.md",
    "commands/curiosity-deep-research.md",
    "commands/curiosity-review.md",
    "commands/curiosity-secure.md",
    "commands/curiosity-verify.md",
    "commands/curiosity-architecture.md",
    "commands/curiosity-spec.md",
    "commands/curiosity-ledger.md",
    "commands/curiosity-implement.md",
    "commands/curiosity-close.md",
  ],
  rules: ["rules/curiosity-delivery.mdc"],
}
const tuples = [
  ["agents/curiosity-strategist.md", "curiosity-strategist", "grok-4.6", true],
  ["agents/curiosity-reviewer.md", "curiosity-reviewer", "claude-sonnet-5", true],
  ["agents/curiosity-researcher.md", "curiosity-researcher", "grok-4.6", true],
  ["agents/curiosity-implementer.md", "curiosity-implementer", "composer-2.5", false],
]
const parse = (source, label) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/); assert.ok(match, label)
  const document = parseDocument(match[1], { uniqueKeys: true }); assert.deepEqual(document.errors, [])
  return { frontmatter: document.toJS(), body: match[2] }
}

test("manifest exposes exact Cursor-native premium bundle", async () => {
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  const validate = new Ajv({ allErrors: true }).compile(JSON.parse(await read("provenance/cursor/plugin.schema.2a804442.json")))
  assert.equal(validate(manifest), true, JSON.stringify(validate.errors))
  for (const [kind, paths] of Object.entries(expected)) assert.deepEqual(manifest[kind], paths)
  for (const prohibited of ["hooks", "mcpServers", "variables"]) assert.equal(prohibited in manifest, false)
  assert.deepEqual((await readdir(new URL("agents", root))).sort(), expected.agents.map((value) => path.basename(value)).sort())
  assert.deepEqual((await readdir(new URL("skills", root))).sort(), expected.skills.map((value) => path.basename(value)).sort())
})

test("four specialists preserve exact role and model contracts", async () => {
  const actual = []
  for (const file of expected.agents) {
    const { frontmatter, body } = parse(await read(file), file)
    actual.push([file, frontmatter.name, frontmatter.model, frontmatter.readonly])
    assert.match(body, /never[^.]*delegate|never orchestrate or delegate/i, file)
    assert.match(body, /REQUIRED SKILLS/i, file)
    assert.match(body, /SKILL_UNAVAILABLE/i, file)
    assert.match(body, /model selection is a preference/i, file)
  }
  assert.deepEqual(actual, tuples)
  assert.equal(new Set(actual.map(([, name]) => name)).size, 4)
})

test("installed surface recursively contains only regular non-executable Markdown", async () => {
  const visit = async (relative) => {
    const stat = await lstat(new URL(relative, root)); assert.equal(stat.isSymbolicLink(), false, relative)
    if (stat.isDirectory()) { for (const entry of await readdir(new URL(relative, root))) await visit(`${relative}/${entry}`); return }
    assert.ok([".md", ".mdc"].includes(path.extname(relative)), relative); assert.equal(stat.mode & 0o111, 0, relative)
    assert.doesNotMatch(await read(relative), /curl[^\n|]*\|\s*(?:ba|z)?sh|plugin-owned (?:CLI|service|daemon|store)|runtime skill loader/i, relative)
  }
  for (const component of Object.values(expected).flat()) await visit(component)
})

test("current docs preserve context, semantic boundary, and static-test limits", async () => {
  for (const file of ["README.md", "docs/architecture/current-state.md", "docs/specs/vanilla-cursor-native-orchestration.md", "docs/migration/0.7.0-command-routing.md", "docs/migration/0.8.0-change-lifecycle.md"]) {
    const source = await read(file)
    assert.match(source, /context|Cursor-only/i, file)
    assert.match(source, /semantic/i, file)
    assert.doesNotMatch(source, /Cursor (?:enforces|guarantees)[^.]*main[^.]*not edit/i, file)
  }
  const smoke = await read("docs/testing/cursor-live-smoke-plan.md")
  for (const value of ["blocking-ambiguity", "false-root-cause", "hidden-criterion", "disguised-architecture", "blind-retry", "security-boundary", "context-compression"]) assert.match(smoke, new RegExp(value))
  assert.match(smoke, /not run/i); assert.match(smoke, /raw transcripts remain outside/i)
})

test("sanitized usage aggregate remains valid", async () => {
  const documentation = await read("docs/provenance/cursor-usage-analysis-2026-08-16.md")
  const bytes = await readFile(new URL("docs/provenance/evidence/cursor-usage-aggregate-2026-08-16.json", root))
  validateCursorUsageAggregate({ bytes, documentation })
  assert.doesNotMatch(documentation, /prompt text|raw transcript|\/Users\//i)
})
