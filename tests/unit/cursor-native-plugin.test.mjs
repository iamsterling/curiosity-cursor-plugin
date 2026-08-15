import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const agentPaths = [
  "agents/curiosity-coordinator.md",
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

const parseAgent = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/)
  assert.ok(match, "agent must contain YAML frontmatter and a non-empty prompt")

  const frontmatter = Object.fromEntries(match[1].split("\n").map((line) => {
    const separator = line.indexOf(":")
    assert.notEqual(separator, -1, `invalid frontmatter line: ${line}`)
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
  }))
  return { frontmatter, prompt: match[2].trim() }
}

test("native Cursor plugin has the exact private Phase 0 and Phase 1 surface", async () => {
  const packageJson = JSON.parse(await read("package.json"))
  assert.equal(packageJson.name, "@iamsterling/curiosity-cursor-plugin")
  assert.equal(packageJson.private, true)

  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  assert.deepEqual(Object.keys(manifest).sort(), ["agents", "author", "description", "license", "name", "version"])
  assert.equal(manifest.name, "curiosity-cursor-plugin")
  assert.equal(manifest.version, "0.1.0")
  assert.equal(manifest.author?.name, "iamsterling")
  assert.equal(manifest.license, "MIT")
  assert.ok(manifest.description)
  assert.deepEqual(manifest.agents, agentPaths)

  for (const path of ["commands", "hooks", "rules", "skills", "mcp.json", ".cursor-plugin/marketplace.json"]) {
    assert.equal(await exists(path), false, `unsupported native component exists: ${path}`)
  }
})

test("native agents use collision-resistant read-only Cursor frontmatter", async () => {
  const parsed = await Promise.all(agentPaths.map(async (path) => parseAgent(await read(path))))
  const names = parsed.map(({ frontmatter }) => frontmatter.name)
  const genericDenylist = new Set(["coordinator", "orchestrator", "researcher", "reviewer", "strategist", "general", "worker"])

  assert.equal(new Set(names).size, names.length)
  for (const { frontmatter, prompt } of parsed) {
    assert.deepEqual(Object.keys(frontmatter).sort(), ["description", "model", "name", "readonly"])
    assert.match(frontmatter.name, /^curiosity-[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.equal(genericDenylist.has(frontmatter.name), false)
    assert.ok(frontmatter.description)
    assert.equal(frontmatter.model, "inherit")
    assert.equal(frontmatter.readonly, "true")
    assert.match(prompt, /(?:do not|never) implement/i)
    assert.doesNotMatch(prompt, /\b(?:will|can) guarantee\b|delegation is guaranteed|\bdeterministic(?:ally)?\b|\benforces?\b|fully autonomous|automatically delegates?/i)
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
  const researcher = parseAgent(await read(agentPaths[1])).prompt
  assert.match(researcher, /bounded curiosity/i)
  assert.match(researcher, /primary sources/i)
  assert.match(researcher, /citations/i)
  assert.match(researcher, /uncertainty/i)

  const reviewer = parseAgent(await read(agentPaths[2])).prompt
  assert.match(reviewer, /independent adversarial/i)
  assert.match(reviewer, /evidence/i)

  const strategist = parseAgent(await read(agentPaths[3])).prompt
  assert.match(strategist, /consequential/i)
  assert.match(strategist, /trade-offs/i)
})

test("native adaptation provenance maps every agent to the reviewed baseline", async () => {
  const provenance = await read("docs/provenance/cursor-native-phase-1.md")
  assert.match(provenance, /5eff1e49852384bc87c8bc162a03927e03cb2e6e/)
  const mappings = {
    "agents/curiosity-coordinator.md": "assets/config/agents/orchestrator.json",
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
