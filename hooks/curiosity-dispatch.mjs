const INPUT_LIMIT = 256 * 1024
const HANDOFF_LIMIT = 32 * 1024
const HANDOFF_MARKER = "[curiosity-handoff/v1]"
const RETURN_CONTRACT = "changed paths; diff summary; raw command output and exit status; mapped evidence; blockers; failures; assumptions"
const PROTECTED = new Set(["subagentStart", "beforeShellExecution", "beforeReadFile"])

const denials = {
  subagentStart: "Curiosity denied malformed subagent hook input.",
  beforeShellExecution: "Curiosity denied malformed shell hook input.",
  beforeReadFile: "Curiosity denied malformed read hook input.",
}

const deny = (user_message) => ({ permission: "deny", user_message })
const allow = () => ({ permission: "allow" })

const malformedEvent = (text) => {
  const match = text.match(/"hook_event_name"\s*:\s*"(subagentStart|beforeShellExecution|beforeReadFile)"/)
  return match?.[1] ?? ""
}

const safePath = (value) => {
  if (!value || value.startsWith("/") || value.includes("\\") || /[*?\[\]{}]/.test(value)) return false
  if (/^[A-Za-z]:/.test(value) || value.includes("//")) return false
  const parts = value.split("/")
  return parts.every((part) => part && part !== "." && part !== "..")
}

const pathListsValid = (ownedValue, prohibitedValue) => {
  const paths = [...ownedValue.split(","), ...prohibitedValue.split(",")].map((item) => item.trim())
  if (paths.some((item) => !safePath(item)) || new Set(paths).size !== paths.length) return false
  for (let index = 0; index < paths.length; index += 1) {
    for (let other = index + 1; other < paths.length; other += 1) {
      if (paths[index].startsWith(`${paths[other]}/`) || paths[other].startsWith(`${paths[index]}/`)) return false
    }
  }
  return true
}

const validHandoff = (task) => {
  if (Buffer.byteLength(task, "utf8") > HANDOFF_LIMIT || /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/u.test(task)) return false
  const lines = task.split("\n")
  const first = lines.findIndex((line) => line.trim() !== "")
  if (first < 0 || lines[first] !== HANDOFF_MARKER) return false
  const fields = [
    ["Role", /^(?:curiosity-worker|curiosity-implementer)$/],
    ["Mode", /^writable$/],
    ["Plan-Accepted", /^yes$/],
    ["Todo", /.+/],
    ["Acceptance", /.+/],
    ["Dependencies", /.+/],
    ["Readiness-Evidence", /.+/],
    ["Owned-Paths", /.+/],
    ["Prohibited-Paths", /.+/],
    ["Transcript-Access", /^prohibited$/],
    ["Session-State-Access", /^prohibited$/],
    ["Checks", /.+/],
    ["Test-First", /^(?:required|not-applicable)$/],
    ["Return", new RegExp(`^${RETURN_CONTRACT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)],
    ["Stop-Conditions", /.+/],
    ["Non-Goals", /.+/],
  ]
  const values = {}
  for (let index = 0; index < fields.length; index += 1) {
    const [name, pattern] = fields[index]
    const prefix = `${name}: `
    const line = lines[first + index + 1]
    if (typeof line !== "string" || !line.startsWith(prefix)) return false
    const value = line.slice(prefix.length)
    if (!pattern.test(value)) return false
    values[name] = value
  }
  const separator = first + fields.length + 1
  if (lines[separator] !== "---" || !lines.slice(separator + 1).some((line) => line.trim())) return false
  return pathListsValid(values["Owned-Paths"], values["Prohibited-Paths"])
}

const sessionStart = () => ({
  additional_context: "Curiosity plugin installation does not activate its skill. Cursor owns native Todos, source, Task context, and evidence; Todos are progress-only. Do not read transcripts or create plugin state. Reconcile raw evidence in the prompt-level Verification Gate.",
})

const subagentStart = (input) => {
  if (typeof input.task !== "string") return deny(denials.subagentStart)
  const first = input.task.split("\n").find((line) => line.trim())
  if (first !== HANDOFF_MARKER) return allow()
  return validHandoff(input.task) ? allow() : deny("Curiosity denied a malformed marked writable handoff.")
}

const consequential = (command) => [
  /(?:^|[;&|]\s*|\s)(?:rm|unlink)\s+(?:[^\n]*\s)?-[^\n]*(?:r|f)/i,
  /(?:^|[;&|]\s*|\s)(?:sudo|doas|chown|chmod)\b/i,
  /\bgit\s+(?:reset\s+--hard|clean\s+-|push\b[^\n]*(?:--force|-f\b)|rebase\b|filter-(?:branch|repo)\b)/i,
  /\b(?:npm|pnpm|yarn|bun)\s+(?:publish|install\b[^\n]*(?:--global|-g\b))/i,
  /\b(?:gh\s+release\s+create|docker\s+push|cargo\s+publish|twine\s+upload)\b/i,
  /\b(?:kubectl\s+(?:apply|delete|replace|patch)|helm\s+(?:install|upgrade|uninstall)|terraform\s+(?:apply|destroy)|pulumi\s+up)\b/i,
  /\b(?:drop|truncate|delete\s+from|alter\s+table|prisma\s+migrate|(?:rails|rake)\s+db:migrate)\b/i,
  /\b(?:kill|killall|pkill|systemctl\s+(?:stop|restart)|launchctl\s+(?:bootout|remove))\b/i,
].some((pattern) => pattern.test(command))

const beforeShell = (input) => {
  if (typeof input.command !== "string" || (input.transcript_path !== undefined && input.transcript_path !== null && typeof input.transcript_path !== "string")) return deny(denials.beforeShellExecution)
  if (input.transcript_path && input.command.includes(input.transcript_path)) return deny("Curiosity denied a command containing the supplied transcript path.")
  if (consequential(input.command)) return { permission: "ask", user_message: "Curiosity requires approval for an enumerated consequential command." }
  return allow()
}

const beforeRead = (input) => {
  if (typeof input.file_path !== "string" || (input.transcript_path !== undefined && input.transcript_path !== null && typeof input.transcript_path !== "string")) return deny(denials.beforeReadFile)
  if (input.attachments !== undefined && !Array.isArray(input.attachments)) return deny(denials.beforeReadFile)
  const attachments = input.attachments ?? []
  if (attachments.some((item) => !item || typeof item !== "object" || !["file", "rule"].includes(item.type) || typeof item.file_path !== "string")) return deny(denials.beforeReadFile)
  if (input.transcript_path && input.file_path === input.transcript_path) return deny("Curiosity denied a read of the supplied transcript path.")
  if (attachments.some((item) => item && typeof item.file_path === "string" && item.file_path === input.transcript_path)) return deny("Curiosity denied a read attachment matching the supplied transcript path.")
  return allow()
}

const postTool = (input) => {
  const command = input?.tool_input?.command
  if (input.tool_name !== "Shell" || typeof command !== "string") return {}
  const marker = command.match(/\[curiosity-evidence\/v1\] check=([a-z0-9]+(?:-[a-z0-9]+)*)(?![A-Za-z0-9_-])/)
  if (!marker || marker.index + marker[0].length > 256) return {}
  return { additional_context: `Evidence check ${marker[1]} ran. Reconcile the actual raw Cursor result as PASS/FAIL/MISSING in the prompt-level Verification Gate. This hook did not inspect command output and declares no verdict.` }
}

const dispatch = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {}
  if (input.hook_event_name === "sessionStart") return sessionStart()
  if (input.hook_event_name === "subagentStart") return subagentStart(input)
  if (input.hook_event_name === "beforeShellExecution") return beforeShell(input)
  if (input.hook_event_name === "beforeReadFile") return beforeRead(input)
  if (input.hook_event_name === "postToolUse") return postTool(input)
  if (input.hook_event_name === "preCompact") return { additional_context: "Run curiosity-engineering status and reconstruct only from Cursor-owned Plan, native Todos, Task context, current source, and raw evidence. Ask the user when context is ambiguous; do not claim restoration or use transcript contents." }
  return {}
}

const main = async () => {
  let text = ""
  let bytes = 0
  let oversized = false
  try {
    for await (const chunk of process.stdin) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      const remaining = INPUT_LIMIT - bytes
      if (remaining > 0) text += buffer.subarray(0, remaining).toString("utf8")
      bytes += buffer.length
      if (bytes > INPUT_LIMIT) oversized = true
    }
  } catch {
    oversized = true
  }
  let output = {}
  if (oversized) {
    const event = malformedEvent(text)
    if (event) output = deny(denials[event])
  } else {
    try {
      output = dispatch(JSON.parse(text))
    } catch {
      const event = malformedEvent(text)
      if (event) output = deny(denials[event])
    }
  }
  process.stdout.write(`${JSON.stringify(output)}\n`)
}

await main()
