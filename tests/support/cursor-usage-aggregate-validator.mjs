import assert from "node:assert/strict"
import { createHash } from "node:crypto"

const percentage = (count, denominator) => `${(count * 100 / denominator).toFixed(1)}%`

const sensitiveValuePatterns = [
  /(?:^|[\s"'=])\/(?:Users\/|private\/|var\/folders\/|tmp\/|home\/)/i,
  /(?:^|[\s"'=])(?:[A-Za-z]:[\\/]|\\\\[^\\/\s]+[\\/][^\\/\s]+)/,
  /\b(?:api[\s_-]?key|access[\s_-]?token|auth[\s_-]?token|token|client[\s_-]?secret|secret|password|passwd|pwd)\b\s*(?:=|:)\s*["']?\S+/i,
  /\b(?:sk-(?:live|test|proj)?[-_A-Za-z0-9]*|github_pat_[A-Za-z0-9_]+|gh[pousr]_[A-Za-z0-9]+|AKIA[0-9A-Z]{8,}|xox[baprs]-[A-Za-z0-9-]+)/,
]

const stringValues = (value) => {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(stringValues)
  if (value && typeof value === "object") return Object.values(value).flatMap(stringValues)
  return []
}

const validateRanking = (entries, denominator, label) => {
  let previous = Number.POSITIVE_INFINITY
  for (const [index, entry] of entries.entries()) {
    assert.equal(entry.rank, index + 1, `${label} rank ${index + 1}`)
    assert.ok(entry.count <= previous, `${label} must be descending`)
    assert.equal(entry.share, percentage(entry.count, denominator), `${label}:${entry.name} denominator`)
    previous = entry.count
  }
}

export const validateCursorUsageAggregate = ({ bytes, documentation }) => {
  const aggregate = JSON.parse(bytes)
  assert.deepEqual(Object.keys(aggregate).sort(), ["counts", "dateRange", "method", "rankings", "schemaVersion"].sort())
  assert.equal(aggregate.schemaVersion, 1)
  assert.equal(aggregate.counts.rootSessions + aggregate.counts.childSessions, aggregate.counts.sessions)
  assert.equal(aggregate.counts.sessionsWithMessages + aggregate.counts.sessionsWithoutMessages, aggregate.counts.sessions)
  assert.equal(aggregate.counts.userMessages + aggregate.counts.assistantMessages + aggregate.counts.otherMessages, aggregate.counts.projectedMessages)

  validateRanking(aggregate.rankings.childAgents, aggregate.counts.childSessions, "child agents")
  assert.equal(aggregate.rankings.childAgents.reduce((sum, entry) => sum + entry.count, 0) + aggregate.rankings.otherChildAgents, aggregate.counts.childSessions)
  validateRanking(aggregate.rankings.skills, aggregate.counts.skillCalls, "skills")
  assert.equal(aggregate.rankings.skills.reduce((sum, entry) => sum + entry.count, 0) + aggregate.rankings.otherSkills, aggregate.counts.skillCalls)

  assert.equal(aggregate.method.httpMethod, "GET")
  assert.ok(aggregate.method.endpoints.every((endpoint) => endpoint.startsWith("/api/") || endpoint === "/openapi.json"))
  assert.equal(aggregate.method.sessionPage.limit, 100)
  assert.deepEqual(aggregate.method.messagePage.adaptiveLimits, [20, 5, 1])
  assert.equal(aggregate.method.deduplication.sessionKey, "session.id")
  assert.equal(aggregate.method.deduplication.toolCallKey, "tool-call id")

  const serialized = bytes.toString("utf8")
  assert.doesNotMatch(serialized, /\bses_[A-Za-z0-9]+\b|\bmsg_[A-Za-z0-9]+\b|\/Users\/|Authorization:|Bearer\s/i)
  for (const value of stringValues(aggregate)) {
    for (const pattern of sensitiveValuePatterns) assert.doesNotMatch(value, pattern, `sensitive aggregate value: ${value}`)
  }
  const digest = createHash("sha256").update(bytes).digest("hex")
  assert.match(documentation, new RegExp(`SHA-256[^\\n]*${digest}`))
  assert.match(documentation, new RegExp(aggregate.dateRange.start.slice(0, 10)))
  assert.match(documentation, new RegExp(aggregate.dateRange.end.slice(0, 10)))
  assert.match(documentation, new RegExp(`${aggregate.counts.sessions.toLocaleString("en-US")} sessions`))
  assert.match(documentation, new RegExp(`${aggregate.counts.childSessions.toLocaleString("en-US")} child sessions`))
  for (const key of ["rootSessions", "sessionsWithMessages", "sessionsWithoutMessages", "projectedMessages", "userMessages", "assistantMessages", "otherMessages", "uniqueToolCalls", "skillCalls"]) {
    assert.match(documentation, new RegExp(aggregate.counts[key].toLocaleString("en-US")), `documentation:${key}`)
  }
  for (const command of aggregate.method.commands) assert.match(documentation, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  for (const endpoint of aggregate.method.endpoints) assert.ok(documentation.includes(endpoint), `documentation:${endpoint}`)
  for (const entry of aggregate.rankings.childAgents.slice(0, 7)) {
    assert.match(documentation, new RegExp(`${entry.name}[^\\n]*${entry.count.toLocaleString("en-US")}[^\\n]*${entry.share}`, "i"))
  }
  for (const entry of aggregate.rankings.skills) {
    assert.match(documentation, new RegExp(`${entry.name.replaceAll("-", "[- ]")}[^\\n]*${entry.count.toLocaleString("en-US")}`, "i"))
  }
  return { aggregate, digest }
}
