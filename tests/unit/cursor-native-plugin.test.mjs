import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import path from "node:path"
import { access, readFile } from "node:fs/promises"
import test from "node:test"
import Ajv from "ajv"
import { parseDocument } from "yaml"

const root = new URL("../../", import.meta.url)
const agentPaths = [
  "agents/curiosity-coordinator.md",
  "agents/curiosity-worker.md",
  "agents/curiosity-implementer.md",
  "agents/curiosity-researcher.md",
  "agents/curiosity-reviewer.md",
  "agents/curiosity-strategist.md",
]

const read = (path) => readFile(new URL(path, root), "utf8")

const exists = async (path) => {
  try {
    await access(new URL(path, root))
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

const parseAgent = (source, file = "agent") => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/)
  assert.ok(match, "agent must contain YAML frontmatter and a non-empty prompt")
  const document = parseDocument(match[1], { uniqueKeys: true })
  assert.deepEqual(document.errors, [], `${file} must contain valid YAML with unique keys`)
  const frontmatter = document.toJS()
  assert.equal(frontmatter && typeof frontmatter, "object", `${file} frontmatter must be a mapping`)
  return { frontmatter, prompt: match[2].trim() }
}

test("official Cursor manifest schema accepts the pinned manifest and rejects undocumented fields", async () => {
  const packageJson = JSON.parse(await read("package.json"))
  assert.equal(packageJson.name, "@iamsterling/curiosity-cursor-plugin")
  assert.equal(packageJson.private, true)

  const schemaSource = await read("provenance/cursor/plugin.schema.2a804442.json")
  assert.equal(createHash("sha256").update(schemaSource).digest("hex"), "a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed")
  const schema = JSON.parse(schemaSource)
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  const validate = new Ajv({ allErrors: true }).compile(schema)
  assert.equal(validate(manifest), true, JSON.stringify(validate.errors))
  assert.equal(validate({ ...manifest, undocumented: true }), false, "official additionalProperties:false must be enforced")
  assert.equal(validate({ ...manifest, author: { name: "iamsterling", undocumented: true } }), false, "official author additionalProperties:false must be enforced")
  assert.equal(validate({ ...manifest, agents: 1 }), false, "official component field types must be enforced")
  assert.equal(validate({ ...manifest, name: "Invalid Name" }), false, "official name pattern must be enforced")
  assert.equal(manifest.name, "curiosity-cursor-plugin")
  assert.equal(manifest.author?.name, "iamsterling")
})

test("local native product policy allows only safe, existing explicit component paths", async () => {
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  assert.deepEqual(Object.keys(manifest).sort(), ["agents", "author", "description", "hooks", "license", "name", "skills", "version"])
  assert.deepEqual(manifest.agents, agentPaths)
  assert.deepEqual(manifest.skills, ["skills/curiosity-engineering"])
  assert.equal(manifest.hooks, "hooks/hooks.json")
  assert.equal(manifest.version, "0.3.2")
  for (const componentPath of [...manifest.agents, ...manifest.skills, manifest.hooks]) {
    assert.equal(path.posix.isAbsolute(componentPath), false)
    assert.equal(path.win32.isAbsolute(componentPath), false)
    assert.equal(componentPath.includes("\\"), false)
    assert.equal(path.posix.normalize(componentPath), componentPath)
    assert.equal(componentPath.split("/").includes(".."), false)
    assert.equal(await exists(componentPath), true, `manifest component does not exist: ${componentPath}`)
  }

  // Cursor discovers these paths even when omitted from the manifest. AGENTS.md is
  // intentionally excluded: it is a workspace instruction, not a plugin component.
  for (const discoveredPath of ["SKILL.md", "rules", "commands", "mcp.json", ".cursor-plugin/marketplace.json"]) {
    assert.equal(await exists(discoveredPath), false, `unsupported native component exists: ${discoveredPath}`)
  }
})

test("official Cursor agent frontmatter has documented scalar types and nonempty prompts", async () => {
  const parsed = await Promise.all(agentPaths.map(async (agentPath) => parseAgent(await read(agentPath), agentPath)))
  for (const { frontmatter, prompt } of parsed) {
    assert.deepEqual(Object.keys(frontmatter).sort(), ["description", "model", "name", "readonly"])
    assert.equal(typeof frontmatter.name, "string")
    assert.equal(typeof frontmatter.description, "string")
    assert.equal(typeof frontmatter.model, "string")
    assert.equal(typeof frontmatter.readonly, "boolean")
    assert.ok(prompt.length > 0)
  }
})

test("YAML parser rejects malformed or duplicate frontmatter keys", () => {
  assert.throws(() => parseAgent("---\nname: first\nname: second\n---\nprompt", "duplicate.md"), /unique keys|Map keys must be unique/i)
  assert.throws(() => parseAgent("---\nname: [unterminated\n---\nprompt", "malformed.md"), /valid YAML/i)
})

test("local naming and authority policy avoids Cursor built-ins and reserves curiosity prefix", async () => {
  const parsed = await Promise.all(agentPaths.map(async (agentPath) => parseAgent(await read(agentPath), agentPath)))
  const names = parsed.map(({ frontmatter }) => frontmatter.name)
  const documentedCursorBuiltins = new Set(["explore", "bash", "browser"])

  assert.equal(new Set(names).size, names.length)
  for (const { frontmatter, prompt } of parsed) {
    assert.match(frontmatter.name, /^curiosity-[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.equal(documentedCursorBuiltins.has(frontmatter.name), false)
    assert.ok(frontmatter.description)
    assert.equal(frontmatter.model, "inherit")
    const writable = new Set(["curiosity-worker", "curiosity-implementer"]).has(frontmatter.name)
    assert.equal(frontmatter.readonly, !writable)
    if (!writable) assert.match(prompt, /(?:do not|never) implement/i)
    assert.doesNotMatch(prompt, /\b(?:will|can) guarantee\b|delegation is guaranteed|\bdeterministic(?:ally)?\b|\benforces?\b|fully autonomous|automatically delegates?/i)
  }
})

test("operator docs state Cursor authentication, workspace, rollback, invocation, and readonly boundaries", async () => {
  const docs = await Promise.all([
    "README.md",
    "docs/installation-architecture.md",
    "docs/decisions/0020-native-cursor-phase-0-and-1.md",
    "docs/architecture/current-state.md",
  ].map(read))
  for (const source of docs) {
    assert.match(source, /authenticat/i)
    assert.match(source, /current working directory|\bCWD\b/i)
    assert.match(source, /AGENTS\.md/)
    assert.match(source, /agent --workspace <target> --plugin-dir <plugin-root>/)
    assert.match(source, /trust[^.]*prompt/i)
    assert.match(source, /trust[^.]*persist|saved trust/i)
    assert.match(source, /\/curiosity-coordinator/)
    assert.match(source, /automatic[^.]*nondeterministic/i)
    assert.match(source, /no file edits|file edits[^.]*no state-changing shell commands/i)
    assert.match(source, /not (?:a )?(?:confidentiality|no-read|local-only)/i)
    assert.match(source, /no live Cursor\/model smoke|live Cursor\/model smoke[^.]*not/i)
  }
})

test("coordinator is advisory and honest about delegation limitations", async () => {
  const { prompt } = parseAgent(await read(agentPaths[0]))
  assert.match(prompt, /not Cursor(?:'|’)s default or primary agent/i)
  assert.match(prompt, /cannot guarantee (?:access to )?the Task tool/i)
  assert.match(prompt, /cannot guarantee delegation or routing/i)
  assert.match(prompt, /report (?:any )?(?:unavailable|failed) delegation/i)
  assert.match(prompt, /complete child prompt/i)
  assert.match(prompt, /avoid overlap/i)
  assert.match(prompt, /synthesize[^.]*evidence/i)
  assert.match(prompt, /selectively delegate/i)
})

test("specialists remain bounded non-implementing advisors", async () => {
  const researcher = parseAgent(await read("agents/curiosity-researcher.md")).prompt
  assert.match(researcher, /bounded curiosity/i)
  assert.match(researcher, /primary sources/i)
  assert.match(researcher, /citations/i)
  assert.match(researcher, /uncertainty/i)

  const reviewer = parseAgent(await read("agents/curiosity-reviewer.md")).prompt
  assert.match(reviewer, /independent adversarial/i)
  assert.match(reviewer, /evidence/i)

  const strategist = parseAgent(await read("agents/curiosity-strategist.md")).prompt
  assert.match(strategist, /consequential/i)
  assert.match(strategist, /trade-offs/i)
})

test("native adaptation provenance maps every agent to the reviewed baseline", async () => {
  const provenance = await read("docs/provenance/cursor-native-phase-1.md")
  assert.match(provenance, /5eff1e49852384bc87c8bc162a03927e03cb2e6e/)
  const mappings = {
    "agents/curiosity-coordinator.md": "assets/config/agents/orchestrator.json",
    "agents/curiosity-worker.md": "assets/config/agents/worker.json",
    "agents/curiosity-implementer.md": "assets/config/agents/implementer.json",
    "agents/curiosity-researcher.md": "assets/config/agents/researcher.json",
    "agents/curiosity-reviewer.md": "assets/config/agents/reviewer.json",
    "agents/curiosity-strategist.md": "assets/config/agents/strategist.json",
  }
  for (const [target, source] of Object.entries(mappings)) {
    assert.ok(provenance.includes(target), `missing target provenance: ${target}`)
    assert.ok(provenance.includes(source), `missing source provenance: ${source}`)
  }
  assert.match(provenance, /not verbatim upstream imports/i)
})
