import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
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

test("hook config exposes exactly one finite fail-open inert stop command", async () => {
  const config = JSON.parse(await read("hooks/hooks.json"))
  assert.deepEqual(config, {
    version: 1,
    hooks: {
      stop: [{
        command: 'node "${CURSOR_PLUGIN_ROOT}/hooks/curiosity-stop.mjs"',
        loop_limit: 5,
        failClosed: false,
      }],
    },
  })
  assert.notEqual(config.hooks.stop[0].loop_limit, null)
})

const fixtures = [
  ["completed-0", '{"status":"completed","loop_count":0}'],
  ["completed-4", '{"status":"completed","loop_count":4}'],
  ["completed-5", '{"status":"completed","loop_count":5}'],
  ["aborted", '{"status":"aborted","loop_count":0}'],
  ["error", '{"status":"error","loop_count":0}'],
  ["unknown", '{"status":"future","loop_count":2}'],
  ["malformed", "{"],
  ["empty", ""],
  ["missing", "{}"],
  ["wrong-fields", '{"status":1,"loop_count":"0"}'],
  ["extra-fields", '{"status":"completed","loop_count":0,"transcript":"secret","extra":true}'],
]

const invokeHook = async (input, cwd) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [fileURLToPath(new URL("../../hooks/curiosity-stop.mjs", import.meta.url))], {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
  })
  let stdout = ""
  let stderr = ""
  const timeout = setTimeout(() => {
    child.kill("SIGKILL")
    reject(new Error("hook exceeded 1000ms timeout"))
  }, 1000)
  child.stdout.on("data", (chunk) => { stdout += chunk })
  child.stderr.on("data", (chunk) => { stderr += chunk })
  child.on("error", reject)
  child.on("close", (code, signal) => {
    clearTimeout(timeout)
    resolve({ code, signal, stdout, stderr })
  })
  child.stdin.end(input)
})

for (const [name, input] of fixtures) {
  test(`inert stop hook returns empty JSON without side effects: ${name}`, async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "curiosity-stop-test-"))
    try {
      const before = await readdir(cwd)
      const result = await invokeHook(input, cwd)
      const after = await readdir(cwd)
      assert.deepEqual(result, { code: 0, signal: null, stdout: "{}\n", stderr: "" })
      assert.deepEqual(JSON.parse(result.stdout), {})
      assert.equal("followup_message" in JSON.parse(result.stdout), false)
      assert.deepEqual(after, before)
    } finally {
      await rm(cwd, { recursive: true, force: true })
    }
  })
}

test("hook code has no shadow runtime, transcript, or continuation capability", async () => {
  const source = await read("hooks/curiosity-stop.mjs")
  for (const pattern of [
    /(?:node:)?fs|writeFile|appendFile|createWriteStream/,
    /child_process|\bspawn\b|execFile|\bexec\s*\(/,
    /worker_threads|\bWorker\b/,
    /setTimeout|setInterval|watch\s*\(/,
    /createServer|\.listen\s*\(/,
    /\bfetch\s*\(|https?:|\bnet\b|WebSocket/,
    /database|\bdb\b|store|cache|lease|session[_ -]?state/i,
    /transcript/i,
    /followup_message/,
    /\bMCP\b/,
    /\.cursor|\.opencode/,
    /\bBeads\b|\bOpenSpec\b/,
  ]) assert.doesNotMatch(source, pattern)
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
