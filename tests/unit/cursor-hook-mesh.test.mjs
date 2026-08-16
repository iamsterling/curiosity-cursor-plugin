import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const dispatcher = fileURLToPath(new URL("hooks/curiosity-dispatch.mjs", root))
const command = 'node "${CURSOR_PLUGIN_ROOT}/hooks/curiosity-dispatch.mjs"'
const deny = (message) => ({ permission: "deny", user_message: message })
const allow = { permission: "allow" }
const RETURN = "changed paths; diff summary; raw command output and exit status; mapped evidence; blockers; failures; assumptions"

const handoff = (changes = {}) => {
  const values = {
    Role: "curiosity-worker",
    Mode: "writable",
    "Plan-Accepted": "yes",
    Todo: "todo-1",
    Acceptance: "the named observable is true",
    Dependencies: "none",
    "Readiness-Evidence": "accepted native Plan and ready Todo",
    "Owned-Paths": "src/a.mjs, tests/a.test.mjs",
    "Prohibited-Paths": "secrets/private.txt",
    "Transcript-Access": "prohibited",
    "Session-State-Access": "prohibited",
    Checks: "node --test tests/a.test.mjs",
    "Test-First": "required",
    Return: RETURN,
    "Stop-Conditions": "scope drift or a failing prerequisite",
    "Non-Goals": "unrelated refactors",
    ...changes,
  }
  return [
    "[curiosity-handoff/v1]",
    ...Object.entries(values).map(([key, value]) => `${key}: ${value}`),
    "---",
    "Implement only the accepted Todo.",
  ].join("\n")
}

const invoke = async (input, cwd) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [dispatcher], { cwd, stdio: ["pipe", "pipe", "pipe"] })
  let stdout = ""
  let stderr = ""
  const timeout = setTimeout(() => {
    child.kill("SIGKILL")
    reject(new Error("dispatcher exceeded 1000ms timeout"))
  }, 1000)
  child.stdout.on("data", (chunk) => { stdout += chunk })
  child.stderr.on("data", (chunk) => { stderr += chunk })
  child.on("error", reject)
  child.on("close", (code, signal) => {
    clearTimeout(timeout)
    resolve({ code, signal, stdout, stderr })
  })
  child.stdin.end(typeof input === "string" ? input : JSON.stringify(input))
})

test("hook config is the exact mixed-posture command mesh", async () => {
  const config = JSON.parse(await readFile(new URL("hooks/hooks.json", root), "utf8"))
  assert.deepEqual(Object.keys(config.hooks), ["sessionStart", "subagentStart", "beforeShellExecution", "beforeReadFile", "postToolUse", "preCompact"])
  for (const [event, definitions] of Object.entries(config.hooks)) {
    assert.equal(definitions.length, 1)
    assert.equal(definitions[0].command, command)
    assert.equal(definitions[0].timeout, 5)
    assert.equal(definitions[0].failClosed, ["subagentStart", "beforeShellExecution", "beforeReadFile"].includes(event))
    assert.deepEqual(Object.keys(definitions[0]).sort(), [...(event === "postToolUse" ? ["matcher"] : []), "command", "failClosed", "timeout"].sort())
  }
  assert.equal(config.hooks.postToolUse[0].matcher, "Shell")
  for (const absent of ["stop", "subagentStop", "preToolUse", "beforeMCPExecution", "afterMCPExecution", "beforeSubmitPrompt", "afterAgentThought", "afterAgentResponse", "sessionEnd", "workspaceOpen"]) {
    assert.equal(absent in config.hooks, false)
  }
})

const transcript = "/private/cursor/transcript.jsonl"
const cases = [
  ["session", { hook_event_name: "sessionStart" }, (value) => assert.match(value.additional_context, /installed[^.]*not[^.]*active|installation[^.]*does not activate/i)],
  ["session malformed", '{"hook_event_name":"sessionStart"', {}],
  ["subagent unmarked", { hook_event_name: "subagentStart", task: "review this" }, allow],
  ["subagent valid worker", { hook_event_name: "subagentStart", task: handoff() }, allow],
  ["subagent valid after blank lines", { hook_event_name: "subagentStart", task: `\n\n${handoff()}` }, allow],
  ["subagent valid implementer", { hook_event_name: "subagentStart", task: handoff({ Role: "curiosity-implementer" }) }, allow],
  ["subagent malformed marked", { hook_event_name: "subagentStart", task: handoff({ Mode: "readonly" }) }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent wrong order", { hook_event_name: "subagentStart", task: handoff().replace("Role: curiosity-worker\nMode: writable", "Mode: writable\nRole: curiosity-worker") }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent traversal", { hook_event_name: "subagentStart", task: handoff({ "Owned-Paths": "../secret" }) }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent absolute", { hook_event_name: "subagentStart", task: handoff({ "Owned-Paths": "/secret" }) }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent backslash", { hook_event_name: "subagentStart", task: handoff({ "Owned-Paths": "src\\a.mjs" }) }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent glob", { hook_event_name: "subagentStart", task: handoff({ "Owned-Paths": "src/*.mjs" }) }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent overlap", { hook_event_name: "subagentStart", task: handoff({ "Owned-Paths": "src", "Prohibited-Paths": "src/private" }) }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent control", { hook_event_name: "subagentStart", task: handoff({ Todo: "bad\u0000value" }) }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent size", { hook_event_name: "subagentStart", task: `${handoff()}${"x".repeat(33 * 1024)}` }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent malformed input", '{"hook_event_name":"subagentStart"', deny("Curiosity denied malformed subagent hook input.")],
  ["protected input over dispatcher limit", `{"hook_event_name":"beforeShellExecution","command":"${"x".repeat(257 * 1024)}"}`, deny("Curiosity denied malformed shell hook input.")],
  ["shell benign", { hook_event_name: "beforeShellExecution", command: "node --test test.mjs", transcript_path: transcript }, allow],
  ["shell destructive", { hook_event_name: "beforeShellExecution", command: "rm -rf build", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell privilege", { hook_event_name: "beforeShellExecution", command: "sudo chmod 600 config", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell git history", { hook_event_name: "beforeShellExecution", command: "git reset --hard HEAD~1", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell publication", { hook_event_name: "beforeShellExecution", command: "npm publish", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell deploy", { hook_event_name: "beforeShellExecution", command: "kubectl apply -f app.yml", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell database mutation", { hook_event_name: "beforeShellExecution", command: "psql -c 'DROP TABLE users'", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell process termination", { hook_event_name: "beforeShellExecution", command: "pkill node", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell global install", { hook_event_name: "beforeShellExecution", command: "npm install -g package", transcript_path: transcript }, { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }],
  ["shell transcript", { hook_event_name: "beforeShellExecution", command: `cat ${transcript}`, transcript_path: transcript, private_value: "DO_NOT_ECHO" }, deny("Curiosity denied a command containing the supplied transcript path.")],
  ["shell malformed object", { hook_event_name: "beforeShellExecution", command: 7 }, deny("Curiosity denied malformed shell hook input.")],
  ["shell malformed json", '{"hook_event_name":"beforeShellExecution"', deny("Curiosity denied malformed shell hook input.")],
  ["read benign", { hook_event_name: "beforeReadFile", file_path: "/repo/a", content: transcript, transcript_path: transcript, attachments: [] }, allow],
  ["read transcript", { hook_event_name: "beforeReadFile", file_path: transcript, content: "DO_NOT_ECHO", transcript_path: transcript, attachments: [] }, deny("Curiosity denied a read of the supplied transcript path.")],
  ["read attachment transcript", { hook_event_name: "beforeReadFile", file_path: "/repo/a", content: "safe", transcript_path: transcript, attachments: [{ type: "file", file_path: transcript }] }, deny("Curiosity denied a read attachment matching the supplied transcript path.")],
  ["read malformed", { hook_event_name: "beforeReadFile", file_path: 7, transcript_path: transcript }, deny("Curiosity denied malformed read hook input.")],
  ["read malformed attachment", { hook_event_name: "beforeReadFile", file_path: "/repo/a", attachments: [{ file_path: "/repo/b" }] }, deny("Curiosity denied malformed read hook input.")],
  ["post unmarked", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: "bun test" }, tool_output: "PASS SECRET" }, {}],
  ["post marked", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: "bun test # [curiosity-evidence/v1] check=focused-tests" }, tool_output: "PASS SECRET" }, (value) => { assert.match(value.additional_context, /focused-tests/); assert.match(value.additional_context, /PASS\/FAIL\/MISSING/); assert.match(value.additional_context, /raw/i); assert.doesNotMatch(value.additional_context, /PASS SECRET|verdict is/i) }],
  ["post invalid marker", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: "bun test # [curiosity-evidence/v1] check=Bad_Slug" }, tool_output: "FAIL SECRET" }, {}],
  ["post marker too late", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: `${"x".repeat(256)}[curiosity-evidence/v1] check=late` }, tool_output: "PASS" }, {}],
  ["post malformed", '{"hook_event_name":"postToolUse"', {}],
  ["preCompact", { hook_event_name: "preCompact" }, (value) => { assert.match(value.additional_context, /status/); assert.match(value.additional_context, /Plan/); assert.match(value.additional_context, /Todos/); assert.match(value.additional_context, /Task context/); assert.doesNotMatch(value.additional_context, /restored|read the transcript/i) }],
  ["preCompact malformed", '{"hook_event_name":"preCompact"', {}],
  ["unknown", { hook_event_name: "futureEvent", private_value: "DO_NOT_ECHO" }, {}],
]

for (const [name, input, expected] of cases) {
  test(`dispatcher fixture: ${name}`, async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "curiosity-hook-test-"))
    try {
      const before = await readdir(cwd)
      const result = await invoke(input, cwd)
      const after = await readdir(cwd)
      assert.equal(result.code, 0)
      assert.equal(result.signal, null)
      assert.equal(result.stderr, "")
      assert.equal(result.stdout.trim().split("\n").length, 1)
      assert.doesNotMatch(result.stdout, /DO_NOT_ECHO|PASS SECRET|FAIL SECRET|private\/cursor/)
      const parsed = JSON.parse(result.stdout)
      if (typeof expected === "function") expected(parsed)
      else assert.deepEqual(parsed, expected)
      assert.deepEqual(after, before)
    } finally {
      await rm(cwd, { recursive: true, force: true })
    }
  })
}

test("dispatcher source has no shadow runtime or forbidden controller", async () => {
  const source = await readFile(dispatcher, "utf8")
  for (const pattern of [
    /\bimport\b|require\s*\(/,
    /(?:node:)?fs|writeFile|appendFile|createWriteStream/,
    /child_process|worker_threads|\bWorker\b/,
    /setTimeout|setInterval|watch\s*\(/,
    /createServer|\.listen\s*\(/,
    /\bfetch\s*\(|https?:|WebSocket|node:net/,
    /writeStore|logger|logging|better-sqlite|leveldb|redis/i,
    /\b(?:fs\.)?readFile\s*\(|\bopen\s*\(|followup_message|MCP/i,
  ]) assert.doesNotMatch(source, pattern)
})

test("hook mesh pins version, official-doc provenance, and writable prompt markers", async () => {
  const packageJson = JSON.parse(await readFile(new URL("package.json", root), "utf8"))
  const manifest = JSON.parse(await readFile(new URL(".cursor-plugin/plugin.json", root), "utf8"))
  const provenance = JSON.parse(await readFile(new URL("provenance/cursor/hook-mesh-official-docs.json", root), "utf8"))
  assert.equal(packageJson.version, "0.4.0")
  assert.equal(manifest.version, "0.4.0")
  assert.deepEqual(provenance.sources.map(({ url }) => url), ["https://cursor.com/docs/hooks.md", "https://cursor.com/docs/reference/plugins.md"])
  for (const source of provenance.sources) assert.match(source.sha256, /^[a-f0-9]{64}$/)
  for (const file of ["agents/curiosity-worker.md", "agents/curiosity-implementer.md", "agents/curiosity-coordinator.md", "skills/curiosity-engineering/SKILL.md"]) {
    const body = await readFile(new URL(file, root), "utf8")
    assert.match(body, /\[curiosity-handoff\/v1\]/)
    assert.match(body, /\[curiosity-evidence\/v1\] check=<slug>/)
  }
  const skill = await readFile(new URL("skills/curiosity-engineering/SKILL.md", root), "utf8")
  assert.match(skill, /Advisor Tasks remain unmarked/)
})
