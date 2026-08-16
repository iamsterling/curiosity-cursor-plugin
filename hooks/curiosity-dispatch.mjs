const INPUT_LIMIT = 256 * 1024
const HANDOFF_LIMIT = 32 * 1024
const HANDOFF_MARKER = "[curiosity-handoff/v1]"
const RETURN_CONTRACT = "changed paths; diff summary; raw command output and exit status; mapped evidence; blockers; failures; assumptions"
const PROTECTED = new Set(["subagentStart", "beforeShellExecution", "beforeReadFile"])
const GUIDANCE = new Set(["sessionStart", "postToolUse", "preCompact"])

const denials = {
  subagentStart: "Curiosity denied malformed subagent hook input.",
  beforeShellExecution: "Curiosity denied malformed shell hook input.",
  beforeReadFile: "Curiosity denied malformed read hook input.",
}

const deny = (user_message) => ({ permission: "deny", user_message })
const allow = () => ({ permission: "allow" })

const rawDiscriminators = (text) => {
  const events = []
  const pattern = /"hook_event_name"\s*:\s*"([^"]*)"/g
  for (const match of text.matchAll(pattern)) events.push(match[1])
  return events
}

const protectedMentions = (text) => {
  const events = []
  const names = "subagentStart|beforeShellExecution|beforeReadFile"
  const pattern = new RegExp(`"hook_event_name"\\s*:\\s*"(${names})(?=["\\s,}\\]]|$)|"(${names})"`, "g")
  for (const match of text.matchAll(pattern)) events.push(match[1] ?? match[2])
  return events
}

const malformedEvent = (text) => {
  return protectedMentions(text)[0] ?? ""
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

const handoffRole = (task) => {
  if (Buffer.byteLength(task, "utf8") > HANDOFF_LIMIT || /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/u.test(task)) return ""
  const lines = task.split("\n")
  const first = lines.findIndex((line) => line.trim() !== "")
  if (first < 0 || lines[first] !== HANDOFF_MARKER) return ""
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
    if (typeof line !== "string" || !line.startsWith(prefix)) return ""
    const value = line.slice(prefix.length)
    if (!pattern.test(value)) return ""
    values[name] = value
  }
  const separator = first + fields.length + 1
  if (lines[separator] !== "---" || !lines.slice(separator + 1).some((line) => line.trim())) return ""
  if (!pathListsValid(values["Owned-Paths"], values["Prohibited-Paths"])) return ""
  return values.Role
}

const sessionStart = () => ({
  additional_context: "Curiosity plugin installation does not activate its skill. Cursor owns native Todos, source, Task context, and evidence; Todos are progress-only. Do not read transcripts or create plugin state. Reconcile raw evidence in the prompt-level Verification Gate.",
})

const subagentStart = (input) => {
  if (typeof input.task !== "string") return deny(denials.subagentStart)
  const first = input.task.split("\n").find((line) => line.trim())
  if (first !== HANDOFF_MARKER) return allow()
  const role = handoffRole(input.task)
  return role && input.subagent_type === role ? allow() : deny("Curiosity denied a malformed marked writable handoff.")
}

const commandSegments = (command) => {
  const segments = []
  let segment = ""
  let quote = ""
  let escaped = false
  for (const character of command) {
    if (escaped) {
      segment += character
      escaped = false
    } else if (character === "\\" && quote !== "'") {
      segment += character
      escaped = true
    } else if (quote) {
      segment += character
      if (character === quote) quote = ""
    } else if (character === "'" || character === '"') {
      quote = character
      segment += character
    } else if (character === ";" || character === "|" || character === "&" || character === "\n") {
      if (segment.trim()) segments.push(segment)
      segment = ""
    } else {
      segment += character
    }
  }
  if (segment.trim()) segments.push(segment)
  return segments
}

const tokensFor = (segment) => {
  const tokens = []
  const pattern = /"(?:\\.|[^"\\])*"|'[^']*'|[^\s"']+/g
  for (const match of segment.matchAll(pattern)) {
    const token = match[0]
    tokens.push((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'")) ? token.slice(1, -1) : token)
  }
  return tokens
}

const executableName = (token) => token.toLowerCase().split("/").at(-1)
const shortOptionHas = (token, flag) => /^-[^-]+$/.test(token) && token.slice(1).includes(flag)
const sqlMutation = (text) => /\b(?:drop|truncate)\b|\bdelete\s+from\b|\balter\s+table\b|\b(?:insert|update)\b/i.test(text)

const consequentialTokens = (tokens) => {
  if (tokens.length === 0) return false
  const command = executableName(tokens[0])
  const action = tokens[1]?.toLowerCase() ?? ""
  const rest = tokens.slice(1)
  const text = rest.join(" ")

  if (command === "rm") {
    for (const token of rest) {
      if (token === "--") break
      if (["--recursive", "--force"].includes(token) || shortOptionHas(token, "r") || shortOptionHas(token, "R") || shortOptionHas(token, "f")) return true
    }
  }
  if (command === "unlink" && rest.some((token) => token === "--force" || shortOptionHas(token, "f"))) return true
  if (command === "find" && rest.includes("-delete")) return true
  if (["sudo", "doas", "chown", "chmod"].includes(command)) return true

  if (command === "git") {
    if (action === "reset" && rest.includes("--hard")) return true
    if (action === "clean" && rest.slice(1).some((token) => token.startsWith("-"))) return true
    if (["rebase", "filter-branch", "filter-repo"].includes(action)) return true
    if (action === "push") {
      const pushArgs = rest.slice(1)
      if (pushArgs.some((token) => token === "-f" || token === "--force" || token === "--force-with-lease" || token.startsWith("--force-with-lease="))) return true
      if (pushArgs.some((token) => /^\+[^+\s]+/.test(token))) return true
    }
  }

  if (["npm", "pnpm", "yarn", "bun"].includes(command) && ["add", "install"].includes(action)) return true
  if (["pip", "pip3"].includes(command) && action === "install") return true
  if (["npm", "pnpm", "yarn", "bun"].includes(command) && action === "publish") return true
  if (command === "gh" && action === "release" && rest[1]?.toLowerCase() === "create") return true
  if (command === "docker" && action === "push") return true
  if (command === "cargo" && action === "publish") return true
  if (command === "twine" && action === "upload") return true

  if (command === "kubectl" && ["apply", "delete", "replace", "patch"].includes(action)) return true
  if (command === "helm" && ["install", "upgrade", "uninstall"].includes(action)) return true
  if (command === "terraform" && ["apply", "destroy"].includes(action)) return true
  if (command === "pulumi" && action === "up") return true

  if (["psql", "mysql", "mariadb", "sqlite3", "mongosh"].includes(command) && sqlMutation(text)) return true
  if (command === "prisma" && action === "migrate") return true
  if (["rails", "rake"].includes(command) && action === "db:migrate") return true

  if (["kill", "killall", "pkill"].includes(command)) return true
  if (command === "systemctl" && ["stop", "restart"].includes(action)) return true
  if (command === "launchctl" && ["bootout", "remove"].includes(action)) return true
  if (command === "docker" && (["stop", "rm", "kill"].includes(action) || (action === "system" && rest[1]?.toLowerCase() === "prune"))) return true

  if (/^mkfs(?:\.|$)/.test(command)) return true
  if (command === "dd" && rest.some((token) => /^of=\/dev\//.test(token))) return true
  if (command === "diskutil" && ["eraseDisk", "eraseVolume", "partitionDisk"].includes(tokens[1])) return true
  return false
}

const consequential = (command) => commandSegments(command).some((segment) => consequentialTokens(tokensFor(segment)))

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
      const input = JSON.parse(text)
      const discriminators = rawDiscriminators(text)
      const protectedEvent = protectedMentions(text)[0]
      const plainObject = input && typeof input === "object" && !Array.isArray(input)
      if (!plainObject || discriminators.length !== 1 || input.hook_event_name !== discriminators[0]) output = protectedEvent ? deny(denials[protectedEvent]) : {}
      else if (!PROTECTED.has(input.hook_event_name) && !GUIDANCE.has(input.hook_event_name) && protectedEvent) output = deny(denials[protectedEvent])
      else output = dispatch(input)
    } catch {
      const event = malformedEvent(text)
      if (event) output = deny(denials[event])
    }
  }
  process.stdout.write(`${JSON.stringify(output)}\n`)
}

await main()
