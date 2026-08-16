export const receiptFields = [
  "classification",
  "frame",
  "probe",
  "evidence",
  "outcome",
  "decision_impact",
  "material_unknowns",
  "curiosity_pass",
  "stop_reason",
  "confidence",
]

export function assessReceipt(receipt) {
  const keys = Object.keys(receipt)
  if (keys.length !== receiptFields.length || keys.some((key, index) => key !== receiptFields[index])) return "MALFORMED"
  if (receipt.classification !== "SUBSTANTIVE") return "MALFORMED"
  if (!["SUPPORTED", "FALSIFIED", "UNRESOLVED"].includes(receipt.outcome)) return "MALFORMED"
  if (!["UNCHANGED", "CHANGED", "ESCALATE"].includes(receipt.decision_impact)) return "MALFORMED"
  if (!["PASS", "FAIL"].includes(receipt.curiosity_pass)) return "MALFORMED"
  if (!["COVERAGE", "SATURATION", "EXHAUSTION", "BLOCKED"].includes(receipt.stop_reason)) return "MALFORMED"
  if (receipt.curiosity_pass === "PASS" && receipt.material_unknowns !== "none") return "REJECT"
  return "ACCEPT"
}

// Repository-development oracle for authored policy examples and tests only,
// not live host behavior; it does not inspect or intercept Cursor execution.
const retryDeltaFields = ["evidence", "hypothesis", "input", "environment", "diagnosticPurpose"]
const cosmeticCommandFlags = /^--(?:no-)?(?:color|pretty)(?:=(?:always|never|auto|true|false))?$/

const shellWords = (command) => {
  const words = []
  let word = ""
  let quote = ""
  let escaped = false
  for (const character of command.trim()) {
    if (escaped) {
      word += character
      escaped = false
      continue
    }
    if (character === "\\" && quote !== "'") {
      escaped = true
      continue
    }
    if (quote) {
      if (character === quote) quote = ""
      else word += character
      continue
    }
    if (character === "'" || character === '"') {
      quote = character
      continue
    }
    if (/\s/.test(character)) {
      if (word) words.push(word)
      word = ""
      continue
    }
    word += character
  }
  if (escaped) word += "\\"
  if (word) words.push(word)
  return words
}

const normalizeCommand = (command = "") => shellWords(command)
  .filter((word) => word !== "--" && !cosmeticCommandFlags.test(word))
  .join("\u0000")

const normalizePatch = (patch = "") => {
  const changes = []
  let target = ""
  for (const rawLine of patch.replaceAll("\r\n", "\n").split("\n")) {
    const line = rawLine.replace(/[ \t]+$/, "")
    if (line.startsWith("+++ ")) {
      target = line.slice(4).split("\t", 1)[0].replace(/^b\//, "")
      changes.push(`file:${target}`)
      continue
    }
    if ((line.startsWith("+") || line.startsWith("-")) && !line.startsWith("+++") && !line.startsWith("---")) {
      changes.push(`${target}:${line}`)
    }
  }
  return changes.length ? changes.join("\n") : patch.replaceAll("\r\n", "\n").trim()
}

const normalizeDelta = (value) => {
  if (typeof value === "string") return value.trim().replace(/\s+/g, " ")
  if (Array.isArray(value)) return value.map(normalizeDelta)
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalizeDelta(value[key])]))
  }
  return value
}

const sameDelta = (previous, next, field) => JSON.stringify(normalizeDelta(previous[field])) === JSON.stringify(normalizeDelta(next[field]))

export function isBlindRetry(previous, next) {
  const previousKind = previous.kind ?? ("patch" in previous ? "patch" : "command")
  const nextKind = next.kind ?? ("patch" in next ? "patch" : "command")
  if (previousKind !== nextKind) return false
  const sameAttempt = previousKind === "patch"
    ? normalizePatch(previous.patch) === normalizePatch(next.patch)
    : normalizeCommand(previous.command) === normalizeCommand(next.command)
  return sameAttempt && retryDeltaFields.every((field) => sameDelta(previous, next, field))
}
