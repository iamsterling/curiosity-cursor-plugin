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
const ask = { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }
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

const invoke = async (event, input, cwd) => new Promise((resolve, reject) => {
  const args = Array.isArray(event) ? event : event ? [event] : []
  const child = spawn(process.execPath, [dispatcher, ...args], { cwd, stdio: ["pipe", "pipe", "pipe"] })
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
    assert.equal(definitions[0].command, `${command} ${event}`)
    assert.equal(definitions[0].timeout, 5)
    assert.equal(definitions[0].failClosed, ["subagentStart", "beforeShellExecution", "beforeReadFile"].includes(event))
    assert.deepEqual(Object.keys(definitions[0]).sort(), [...(event === "postToolUse" ? ["matcher"] : []), "command", "failClosed", "timeout"].sort())
  }
  assert.equal(config.hooks.postToolUse[0].matcher, "Shell")
  for (const absent of ["stop", "subagentStop", "preToolUse", "beforeMCPExecution", "afterMCPExecution", "beforeSubmitPrompt", "afterAgentThought", "afterAgentResponse", "sessionEnd", "workspaceOpen"]) {
    assert.equal(absent in config.hooks, false)
  }
})

test("bound event is the sole authority for malformed posture and dispatch", async () => {
  const cwd = await mkdtemp(path.join(tmpdir(), "curiosity-hook-bound-test-"))
  const malformed = [
    "",
    "{",
    "[]",
    "null",
    "{}",
    '{"hook_event_name":"futureEvent"}',
    '{"hook_event_name":"beforeShellExecution","hook_event_name":"beforeShellExecution","command":"echo ok"}',
    '{"hook_event_name":"beforeShellExecution","nested":{"hook_event_name":"beforeShellExecution"},"command":"echo ok"}',
    '{"hook_event_name":"sessionStart","nested":{"hook_event_name":"beforeShellExecution"}}',
  ]
  try {
    for (const event of ["subagentStart", "beforeShellExecution", "beforeReadFile"]) {
      for (const input of malformed) {
        const result = await invoke(event, input, cwd)
        assert.deepEqual(JSON.parse(result.stdout), deny({
          subagentStart: "Curiosity denied malformed subagent hook input.",
          beforeShellExecution: "Curiosity denied malformed shell hook input.",
          beforeReadFile: "Curiosity denied malformed read hook input.",
        }[event]))
      }
      for (const input of [
        '{"hook_event_nam\\u0065":"sessionStart"}',
        '{"hook_event_name":"sessionSt\\u0061rt"}',
        `{"hook_event_name":"${event}","value":"${"x".repeat(257 * 1024)}"}`,
      ]) {
        const result = await invoke(event, input, cwd)
        assert.deepEqual(JSON.parse(result.stdout), deny({
          subagentStart: "Curiosity denied malformed subagent hook input.",
          beforeShellExecution: "Curiosity denied malformed shell hook input.",
          beforeReadFile: "Curiosity denied malformed read hook input.",
        }[event]))
      }
    }
    for (const event of ["sessionStart", "postToolUse", "preCompact"]) {
      for (const input of [
        ...malformed,
        '{"hook_event_nam\\u0065":"beforeShellExecution"}',
        '{"hook_event_name":"beforeShellExec\\u0075tion"}',
        `{"hook_event_name":"${event}","value":"${"x".repeat(257 * 1024)}"}`,
      ]) {
        const result = await invoke(event, input, cwd)
        assert.deepEqual(JSON.parse(result.stdout), {})
      }
    }
    for (const event of [undefined, "futureEvent", ["beforeShellExecution", "sessionStart"], "beforeShellExecution", "beforeReadFile"]) {
      const input = event === "beforeReadFile"
        ? '{"hook_event_nam\\u0065":"beforeReadF\\u0069le","file_path":"/repo/a"}'
        : '{"hook_event_nam\\u0065":"beforeShellExec\\u0075tion","command":"echo ok"}'
      const result = await invoke(event, input, cwd)
      const expected = event === "beforeShellExecution" || event === "beforeReadFile" ? allow : {}
      assert.deepEqual(JSON.parse(result.stdout), expected)
    }
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
})

const transcript = "/private/cursor/transcript.jsonl"
const cases = [
  ["session", { hook_event_name: "sessionStart" }, (value) => assert.match(value.additional_context, /installed[^.]*not[^.]*active|installation[^.]*does not activate/i)],
  ["session malformed", '{"hook_event_name":"sessionStart"', {}],
  ["subagent unmarked", { hook_event_name: "subagentStart", task: "review this" }, allow],
  ["subagent valid worker", { hook_event_name: "subagentStart", subagent_type: "curiosity-worker", task: handoff() }, allow],
  ["subagent valid after blank lines", { hook_event_name: "subagentStart", subagent_type: "curiosity-worker", task: `\n\n${handoff()}` }, allow],
  ["subagent valid implementer", { hook_event_name: "subagentStart", subagent_type: "curiosity-implementer", task: handoff({ Role: "curiosity-implementer" }) }, allow],
  ["subagent marked missing official type", { hook_event_name: "subagentStart", task: handoff() }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent marked mismatched official type", { hook_event_name: "subagentStart", subagent_type: "curiosity-implementer", task: handoff() }, deny("Curiosity denied a malformed marked writable handoff.")],
  ["subagent marked built-in type", { hook_event_name: "subagentStart", subagent_type: "generalPurpose", task: handoff() }, deny("Curiosity denied a malformed marked writable handoff.")],
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
  ["subagent unicode-escaped protected event malformed", '{"hook_event_name":"subagentSt\\u0061rt","task":7}', deny("Curiosity denied malformed subagent hook input.")],
  ["subagent truncated discriminator value", '{"hook_event_name":"subagentStart', deny("Curiosity denied malformed subagent hook input.")],
  ["protected input over dispatcher limit", `{"hook_event_name":"beforeShellExecution","command":"${"x".repeat(257 * 1024)}"}`, deny("Curiosity denied malformed shell hook input.")],
  ["shell benign", { hook_event_name: "beforeShellExecution", command: "node --test test.mjs", transcript_path: transcript }, allow],
  ["shell deletion recursive", { hook_event_name: "beforeShellExecution", command: "rm -rf build", transcript_path: transcript }, ask],
  ["shell unicode-escaped protected event", '{"hook_event_name":"beforeShellExec\\u0075tion","command":"rm -rf build"}', ask],
  ["shell escaped discriminator key", '{"hook_event_nam\\u0065":"beforeShellExecution","command":"rm -rf build"}', ask],
  ["shell deletion long force", { hook_event_name: "beforeShellExecution", command: "rm --force build", transcript_path: transcript }, ask],
  ["shell deletion trailing force", { hook_event_name: "beforeShellExecution", command: "rm build -f", transcript_path: transcript }, ask],
  ["shell deletion interactive short", { hook_event_name: "beforeShellExecution", command: "rm -i file", transcript_path: transcript }, allow],
  ["shell deletion interactive long", { hook_event_name: "beforeShellExecution", command: "rm --interactive file", transcript_path: transcript }, allow],
  ["shell deletion option-like operand", { hook_event_name: "beforeShellExecution", command: "rm -- ./report-rf.txt", transcript_path: transcript }, allow],
  ["shell find delete", { hook_event_name: "beforeShellExecution", command: "find . -name '*.tmp' -delete", transcript_path: transcript }, ask],
  ["shell find print", { hook_event_name: "beforeShellExecution", command: "find . -name '*.tmp' -print", transcript_path: transcript }, allow],
  ["shell privilege", { hook_event_name: "beforeShellExecution", command: "sudo chmod 600 config", transcript_path: transcript }, ask],
  ["shell privilege prose", { hook_event_name: "beforeShellExecution", command: "printf '%s' 'sudo chmod'", transcript_path: transcript }, allow],
  ["shell git reset", { hook_event_name: "beforeShellExecution", command: "git reset --hard HEAD~1", transcript_path: transcript }, ask],
  ["shell git clean", { hook_event_name: "beforeShellExecution", command: "git clean -fd", transcript_path: transcript }, ask],
  ["shell git forced flag", { hook_event_name: "beforeShellExecution", command: "git push origin main --force-with-lease", transcript_path: transcript }, ask],
  ["shell git forced refspec", { hook_event_name: "beforeShellExecution", command: "git push origin +main:main", transcript_path: transcript }, ask],
  ["shell git ordinary push", { hook_event_name: "beforeShellExecution", command: "git push origin main", transcript_path: transcript }, allow],
  ["shell git plus in ref name", { hook_event_name: "beforeShellExecution", command: "git push origin feature+name", transcript_path: transcript }, allow],
  ["shell publication", { hook_event_name: "beforeShellExecution", command: "npm publish", transcript_path: transcript }, ask],
  ["shell publication prose", { hook_event_name: "beforeShellExecution", command: "echo 'npm publish'", transcript_path: transcript }, allow],
  ["shell kubectl mutation", { hook_event_name: "beforeShellExecution", command: "kubectl apply -f app.yml", transcript_path: transcript }, ask],
  ["shell terraform mutation", { hook_event_name: "beforeShellExecution", command: "terraform destroy", transcript_path: transcript }, ask],
  ["shell infrastructure read", { hook_event_name: "beforeShellExecution", command: "kubectl get pods && terraform plan", transcript_path: transcript }, allow],
  ["shell database psql mutation", { hook_event_name: "beforeShellExecution", command: "psql -c 'DROP TABLE users'", transcript_path: transcript }, ask],
  ["shell database mysql mutation", { hook_event_name: "beforeShellExecution", command: "mysql app -e 'DELETE FROM users'", transcript_path: transcript }, ask],
  ["shell database migration", { hook_event_name: "beforeShellExecution", command: "prisma migrate deploy", transcript_path: transcript }, ask],
  ["shell database mutation prose", { hook_event_name: "beforeShellExecution", command: "echo 'DROP TABLE users'", transcript_path: transcript }, allow],
  ["shell database read", { hook_event_name: "beforeShellExecution", command: "psql -c 'SELECT * FROM users'", transcript_path: transcript }, allow],
  ["shell process termination", { hook_event_name: "beforeShellExecution", command: "pkill node", transcript_path: transcript }, ask],
  ["shell process inspection", { hook_event_name: "beforeShellExecution", command: "pgrep node", transcript_path: transcript }, allow],
  ["shell docker stop", { hook_event_name: "beforeShellExecution", command: "docker stop app", transcript_path: transcript }, ask],
  ["shell docker rm", { hook_event_name: "beforeShellExecution", command: "docker rm app", transcript_path: transcript }, ask],
  ["shell docker kill", { hook_event_name: "beforeShellExecution", command: "docker kill app", transcript_path: transcript }, ask],
  ["shell docker system prune", { hook_event_name: "beforeShellExecution", command: "docker system prune -f", transcript_path: transcript }, ask],
  ["shell docker inspect", { hook_event_name: "beforeShellExecution", command: "docker ps", transcript_path: transcript }, allow],
  ["shell npm add", { hook_event_name: "beforeShellExecution", command: "npm add left-pad", transcript_path: transcript }, ask],
  ["shell npm install", { hook_event_name: "beforeShellExecution", command: "npm install left-pad", transcript_path: transcript }, ask],
  ["shell pnpm add", { hook_event_name: "beforeShellExecution", command: "pnpm add left-pad", transcript_path: transcript }, ask],
  ["shell pnpm install", { hook_event_name: "beforeShellExecution", command: "pnpm install", transcript_path: transcript }, ask],
  ["shell yarn add", { hook_event_name: "beforeShellExecution", command: "yarn add left-pad", transcript_path: transcript }, ask],
  ["shell yarn install", { hook_event_name: "beforeShellExecution", command: "yarn install", transcript_path: transcript }, ask],
  ["shell bun add", { hook_event_name: "beforeShellExecution", command: "bun add left-pad", transcript_path: transcript }, ask],
  ["shell bun install", { hook_event_name: "beforeShellExecution", command: "bun install", transcript_path: transcript }, ask],
  ["shell pip install", { hook_event_name: "beforeShellExecution", command: "pip install requests", transcript_path: transcript }, ask],
  ["shell pip3 install", { hook_event_name: "beforeShellExecution", command: "pip3 install requests", transcript_path: transcript }, ask],
  ["shell package script", { hook_event_name: "beforeShellExecution", command: "npm run install", transcript_path: transcript }, allow],
  ["shell package prose", { hook_event_name: "beforeShellExecution", command: "echo 'pip install requests'", transcript_path: transcript }, allow],
  ["shell raw disk dd", { hook_event_name: "beforeShellExecution", command: "dd if=image.img of=/dev/disk4", transcript_path: transcript }, ask],
  ["shell raw disk mkfs", { hook_event_name: "beforeShellExecution", command: "mkfs.ext4 /dev/sdb1", transcript_path: transcript }, ask],
  ["shell raw disk benign dd", { hook_event_name: "beforeShellExecution", command: "dd if=input.bin of=output.bin", transcript_path: transcript }, allow],
  ["shell transcript", { hook_event_name: "beforeShellExecution", command: `cat ${transcript}`, transcript_path: transcript, private_value: "DO_NOT_ECHO" }, deny("Curiosity denied a command containing the supplied transcript path.")],
  ["shell malformed object", { hook_event_name: "beforeShellExecution", command: 7 }, deny("Curiosity denied malformed shell hook input.")],
  ["shell malformed json", '{"hook_event_name":"beforeShellExecution"', deny("Curiosity denied malformed shell hook input.")],
  ["shell truncated discriminator value", '{"hook_event_name":"beforeShellExecution', deny("Curiosity denied malformed shell hook input.")],
  ["protected duplicate discriminator", '{"hook_event_name":"futureEvent","hook_event_name":"beforeShellExecution","command":"echo ok"}', deny("Curiosity denied malformed shell hook input.")],
  ["protected mixed escaped contradictory discriminator", '{"hook_event_name":"sessionStart","hook_event_nam\\u0065":"beforeShellExec\\u0075tion","command":"echo ok"}', deny("Curiosity denied malformed shell hook input.")],
  ["protected mixed escaped duplicate discriminator", '{"hook_event_name":"beforeReadFile","hook_event_nam\\u0065":"beforeReadF\\u0069le","file_path":"/repo/a"}', deny("Curiosity denied malformed read hook input.")],
  ["protected duplicate same discriminator", '{"hook_event_name":"beforeReadFile","hook_event_name":"beforeReadFile","file_path":"/repo/a"}', deny("Curiosity denied malformed read hook input.")],
  ["protected nested discriminator", { hook_event_name: "sessionStart", nested: { hook_event_name: "beforeReadFile" } }, deny("Curiosity denied malformed read hook input.")],
  ["protected nonobject payload", [{ hook_event_name: "subagentStart" }], deny("Curiosity denied malformed subagent hook input.")],
  ["protected nonobject scalar indication", ["beforeReadFile"], deny("Curiosity denied malformed read hook input.")],
  ["protected contradictory unknown discriminator", { hook_event_name: "futureEvent", nested: { hook_event_name: "beforeShellExecution" } }, deny("Curiosity denied malformed shell hook input.")],
  ["read benign", { hook_event_name: "beforeReadFile", file_path: "/repo/a", content: transcript, transcript_path: transcript, attachments: [] }, allow],
  ["read transcript", { hook_event_name: "beforeReadFile", file_path: transcript, content: "DO_NOT_ECHO", transcript_path: transcript, attachments: [] }, deny("Curiosity denied a read of the supplied transcript path.")],
  ["read attachment transcript", { hook_event_name: "beforeReadFile", file_path: "/repo/a", content: "safe", transcript_path: transcript, attachments: [{ type: "file", file_path: transcript }] }, deny("Curiosity denied a read attachment matching the supplied transcript path.")],
  ["read malformed", { hook_event_name: "beforeReadFile", file_path: 7, transcript_path: transcript }, deny("Curiosity denied malformed read hook input.")],
  ["read unicode-escaped protected event malformed", '{"hook_event_name":"beforeReadF\\u0069le","file_path":7}', deny("Curiosity denied malformed read hook input.")],
  ["read malformed attachment", { hook_event_name: "beforeReadFile", file_path: "/repo/a", attachments: [{ file_path: "/repo/b" }] }, deny("Curiosity denied malformed read hook input.")],
  ["read truncated discriminator value", '{"hook_event_name":"beforeReadFile', deny("Curiosity denied malformed read hook input.")],
  ["post unmarked", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: "bun test" }, tool_output: "PASS SECRET" }, {}],
  ["post marked", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: "bun test # [curiosity-evidence/v1] check=focused-tests" }, tool_output: "PASS SECRET" }, (value) => { assert.match(value.additional_context, /focused-tests/); assert.match(value.additional_context, /PASS\/FAIL\/MISSING/); assert.match(value.additional_context, /raw/i); assert.doesNotMatch(value.additional_context, /PASS SECRET|verdict is/i) }],
  ["post invalid marker", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: "bun test # [curiosity-evidence/v1] check=Bad_Slug" }, tool_output: "FAIL SECRET" }, {}],
  ["post marker too late", { hook_event_name: "postToolUse", tool_name: "Shell", tool_input: { command: `${"x".repeat(256)}[curiosity-evidence/v1] check=late` }, tool_output: "PASS" }, {}],
  ["post malformed", '{"hook_event_name":"postToolUse"', {}],
  ["preCompact", { hook_event_name: "preCompact" }, (value) => { assert.match(value.additional_context, /status/); assert.match(value.additional_context, /Plan/); assert.match(value.additional_context, /Todos/); assert.match(value.additional_context, /Task context/); assert.doesNotMatch(value.additional_context, /restored|read the transcript/i) }],
  ["preCompact malformed", '{"hook_event_name":"preCompact"', {}],
  ["guidance unicode-escaped event", '{"hook_event_name":"sessionSt\\u0061rt"}', (value) => assert.match(value.additional_context, /installation[^.]*does not activate/i)],
  ["guidance escaped key and event", '{"hook_event_nam\\u0065":"preComp\\u0061ct"}', (value) => assert.match(value.additional_context, /reconstruct/i)],
  ["guidance duplicate discriminator malformed", '{"hook_event_name":"sessionStart","hook_event_name":"preCompact"}', {}],
  ["guidance mixed escaped duplicate malformed", '{"hook_event_name":"sessionStart","hook_event_nam\\u0065":"preComp\\u0061ct"}', {}],
  ["unknown", { hook_event_name: "futureEvent", private_value: "DO_NOT_ECHO" }, {}],
]

const boundEventFor = (name) => {
  if (name.startsWith("guidance duplicate") || name.startsWith("guidance mixed")) return "sessionStart"
  if (name.startsWith("session") || name.startsWith("guidance unicode")) return "sessionStart"
  if (name.startsWith("subagent")) return "subagentStart"
  if (name.startsWith("shell") || name === "protected input over dispatcher limit" || name.includes("contradictory")) return "beforeShellExecution"
  if (name.startsWith("read") || name.includes("same discriminator") || name.includes("nested discriminator") || name.includes("nonobject scalar") || name.includes("mixed escaped duplicate")) return "beforeReadFile"
  if (name.startsWith("post")) return "postToolUse"
  if (name.startsWith("preCompact") || name.startsWith("guidance escaped")) return "preCompact"
  if (name.includes("nonobject payload")) return "subagentStart"
  if (name.startsWith("protected duplicate")) return "beforeShellExecution"
  return "futureEvent"
}

for (const [name, input, expected] of cases) {
  test(`dispatcher fixture: ${name}`, async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "curiosity-hook-test-"))
    try {
      const before = await readdir(cwd)
      const result = await invoke(boundEventFor(name), input, cwd)
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
    /node:fs|from\s+["']fs["']|require\s*\(\s*["']fs["']|writeFile|appendFile|createWriteStream/,
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
