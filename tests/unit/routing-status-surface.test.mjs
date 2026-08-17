import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const canonicalDefinitions = {
  routing: /`BLOCKED_ROUTING` applies only for missing or failed Task dispatch, named agent routing, or named skill routing\./,
  authority: /`BLOCKED_AUTHORITY` applies only after routing succeeds when the requested action, write, path, command, or network access exceeds granted authority\./,
}
const fixtures = {
  allowed: [
    "Missing Task, named agent, or named skill routing returns `BLOCKED_ROUTING`; an action beyond granted paths returns `BLOCKED_AUTHORITY` after routing succeeds.",
    "Terminal precedence is `BLOCKED_ROUTING` (Task/agent/skill routing only), `BLOCKED_AUTHORITY` (successfully routed action beyond grant).",
  ],
  rejected: [
    "Main delegates each mutation to exactly one implementer or returns `BLOCKED_AUTHORITY`.",
    "If the required named agent is unavailable, return `BLOCKED_AUTHORITY`.",
    "A failed Task dispatch yields `BLOCKED_AUTHORITY`.",
  ],
}

const authorityContradictions = (source) => source.split("\n").flatMap((line, index) => {
  if (!line.includes("BLOCKED_AUTHORITY")) return []
  const contradictory = line.split(/[.;]/).some((clause) => {
    if (!clause.includes("BLOCKED_AUTHORITY")) return false
    const routingUnavailable = /(?:missing|unavailable|failed|cannot|unable)[^\n]{0,100}(?:Task|dispatch|named (?:agent|skill)|(?:agent|skill) routing)|(?:Task|dispatch|named (?:agent|skill)|(?:agent|skill) routing)[^\n]{0,100}(?:missing|unavailable|failed|cannot|unable)/i.test(clause)
    const delegationFallback = /(?:delegat(?:e|es|ion)|exactly-one-implementer)[^\n]{0,80}(?:or|otherwise)[^\n]{0,40}`?BLOCKED_AUTHORITY`?/i.test(clause)
    return routingUnavailable || delegationFallback
  })
  return contradictory ? [{ line: index + 1, text: line }] : []
})

test("routing and authority contradiction detector has explicit canonical fixtures", () => {
  for (const source of fixtures.allowed) assert.deepEqual(authorityContradictions(source), [], source)
  for (const source of fixtures.rejected) assert.equal(authorityContradictions(source).length, 1, source)
})

test("active normative Markdown, MDC, and JSON keep canonical routing and authority meanings", async () => {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })
    .trim().split("\n")
    .filter((file) => /\.(?:md|mdc|json)$/.test(file) && !file.startsWith("provenance/history/"))

  const rule = await read("rules/curiosity-delivery.mdc")
  assert.match(rule, canonicalDefinitions.routing)
  assert.match(rule, canonicalDefinitions.authority)

  const failures = []
  for (const file of files) {
    for (const finding of authorityContradictions(await read(file))) failures.push(`${file}:${finding.line}: ${finding.text}`)
  }
  assert.deepEqual(failures, [], failures.join("\n"))
})
