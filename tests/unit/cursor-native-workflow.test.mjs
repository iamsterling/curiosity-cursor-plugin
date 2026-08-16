import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { parseDocument } from "yaml"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")

const parseSkill = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/)
  assert.ok(match, "skill must contain YAML frontmatter and a non-empty body")
  const document = parseDocument(match[1], { uniqueKeys: true })
  assert.deepEqual(document.errors, [], "skill frontmatter must be valid YAML with unique keys")
  return { frontmatter: document.toJS(), body: match[2].trim() }
}

test("engineering skill is model-eligible and specifies the accepted native workflow", async () => {
  const { frontmatter, body } = parseSkill(await read("skills/curiosity-engineering/SKILL.md"))
  assert.deepEqual(Object.keys(frontmatter).sort(), ["description", "name"])
  assert.equal(frontmatter.name, "curiosity-engineering")
  assert.equal(typeof frontmatter.description, "string")
  assert.ok(frontmatter.description.length > 0)
  assert.equal("disable-model-invocation" in frontmatter, false)

  for (const pattern of [
    /\/curiosity-engineering/,
    /model-selected|model may (?:also )?select/i,
    /AskQuestion/,
    /neutral[^.]*bounded|bounded[^.]*neutral/i,
    /skip|cancel/i,
    /infer no|do not infer/i,
    /unavailable|nonblocking/i,
    /Plan Mode/,
    /user[^.]*select/i,
    /never claim[^.]*changed|do not claim[^.]*switch/i,
    /explicit[^.]*accept/i,
    /before[^.]*edit/i,
    /Agent Todos/,
    /observable[^.]*evidence/i,
    /parent[^.]*coordination[^.]*evidence reconciliation/i,
    /curiosity-worker/,
    /curiosity-implementer/,
    /curiosity-coordinator/,
    /curiosity-researcher/,
    /curiosity-reviewer/,
    /curiosity-strategist/,
    /delegat[^.]*honest|report[^.]*delegat/i,
    /Verification Gate[^.]*before[^.]*completion confirmation/i,
    /no plugin-owned state|plugin-owned state[^.]*none/i,
    /no (?:custom )?(?:lifecycle )?runtime/i,
    /no OpenSpec|OpenSpec[^.]*no implementation/i,
    /no Beads|Beads[^.]*no implementation/i,
    /no MCP|MCP[^.]*no/i,
    /no completion authority|completion authority[^.]*none/i,
    /There is no automatic continuation/,
    /explicit user confirmation[^.]*Verification Gate[^.]*PASS/i,
  ]) assert.match(body, pattern)
})

test("skill parser rejects duplicate YAML keys", () => {
  assert.throws(() => parseSkill("---\nname: first\nname: second\n---\nbody"), /unique keys|Map keys must be unique/i)
})

test("native slice does not add accidental components or tracked runtime artifacts", async () => {
  for (const absent of ["SKILL.md", "commands", "rules", "mcp.json", ".cursor-plugin/marketplace.json"]) {
    await assert.rejects(readFile(new URL(absent, root)), { code: "ENOENT" })
  }
  const tracked = await new Promise((resolve, reject) => {
    const child = spawn("git", ["ls-files", "-z"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (chunk) => { stdout += chunk })
    child.stderr.on("data", (chunk) => { stderr += chunk })
    child.on("error", reject)
    child.on("close", (code) => code === 0 ? resolve(stdout.split("\0").filter(Boolean)) : reject(new Error(stderr)))
  })
  for (const file of tracked) {
    assert.doesNotMatch(file, /(^|\/)(?:node_modules|\.cursor|\.opencode|logs?|caches?)(\/|$)|(?:^|\/)\.env(?:\.|$)/i)
  }
})
