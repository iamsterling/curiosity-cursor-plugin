import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const readme = await readFile(new URL("README.md", root), "utf8")
const commands = [
  "curiosity-deliver-change", "curiosity-bug", "curiosity-feature",
  "curiosity-deep-research", "curiosity-review", "curiosity-secure",
  "curiosity-verify", "curiosity-architecture", "curiosity-spec",
  "curiosity-ledger", "curiosity-implement", "curiosity-close",
]

test("README has the concise interview-ready shape", () => {
  const words = readme.match(/\b[\p{L}\p{N}][\p{L}\p{N}’'./*-]*\b/gu) ?? []
  const lines = readme.trimEnd().split("\n")
  assert.ok(words.length >= 420 && words.length <= 500, `word count: ${words.length}`)
  assert.ok(lines.length >= 50 && lines.length <= 70, `line count: ${lines.length}`)
  assert.deepEqual(readme.match(/^# .+$/gm), ["# Curiosity for Cursor"])
  assert.equal((readme.match(/^```(?:\w+)?$/gm) ?? []).length, 2, "exactly one fenced block")
  assert.match(lines.slice(0, 5).join("\n"), /curiosity-hero\.svg/)
})

test("README states product facts and resolves the command inventory", () => {
  assert.match(readme, /Cursor-only/i)
  assert.match(readme, /v0\.8\.0/)
  assert.match(readme, /public MIT|MIT-licensed/i)
  assert.match(readme, /4 agents.*5 skills.*12 commands.*1 rule/is)
  for (const command of commands) assert.match(readme, new RegExp(`/${command}\\b`), command)
  for (const group of ["Deliver", "Decide", "Assure", "Lifecycle"]) assert.match(readme, new RegExp(`\\| ${group} \\|`))
  assert.match(readme, /recommend[^\n]*`\/curiosity-deliver-change <request>`/i)
})

test("README setup is Cursor-native and dependency-free for users", () => {
  const setup = readme.match(/## Set up in Cursor\n([\s\S]*?)(?=\n## )/)?.[1] ?? ""
  assert.match(setup, /repository already open in Cursor/i)
  assert.match(setup, /manifest-referenced (?:static )?assets/i)
  assert.match(setup, /~\/\.cursor\/plugins\/local\/(?:<plugin>|curiosity-cursor-plugin)/i)
  assert.match(setup, /(?:explicit|owner) (?:owner )?(?:permission|authorization|approval)[^\n]*before[^\n]*outside (?:the )?(?:workspace|repository|project)/i)
  assert.match(setup, /Cursor (?:IDE )?Agent[^\n]*(?:copy|file)/i)
  assert.match(setup, /reload or restart Cursor IDE/i)
  assert.match(setup, /fresh (?:IDE )?Agent chat/i)
  assert.match(setup, /host discovery/i)
  assert.match(setup, /static files[^\n]*do not prove discovery/i)
  assert.match(setup, /4 agents.*5 skills.*12 commands.*1 rule/is)
  for (const command of commands) assert.match(setup, new RegExp(`/${command}\\b`), command)
  assert.match(setup, /no (?:Node|Bun|npm|package manager)/i)
  assert.match(setup, /no .*OpenSpec CLI.*hooks.*MCP.*installer/is)
  assert.doesNotMatch(setup, /Customize|--plugin-dir|Cursor Agent CLI|\bnpm (?:i|install)\b|\bbun install\b/i)
  assert.match(readme, /installed bundle[^\n]*(?:manifest|Markdown\/MDC)/i)
  assert.match(readme, /development verification[^\n]*Bun/i)
  assert.match(readme, /installed plugin[^\n]*only Cursor/i)
})

test("README exposes semantic trust limits without host-enforcement claims", () => {
  for (const term of ["routing", "skill use", "main no-edit", "path", "network", "model"]) assert.match(readme, new RegExp(term, "i"), term)
  assert.match(readme, /host.*version.*policy.*semantic/is)
  assert.match(readme, /observed behavior must be verified/i)
  assert.doesNotMatch(readme, /host-enforced|guarantees? (?:routing|isolation|read.?only)|proves? discovery from files/i)
  assert.match(readme, /no runtime.*hooks.*MCP.*state store/is)
  assert.match(readme, /OpenSpec-compatible[^\n]*not formal adoption/i)
  assert.match(readme, /No marketplace.*npm.*global-install.*public-release claim/is)
  assert.match(readme, /isolated IDE smoke[^\n]*before behavioral claims/i)
})

test("README local links and images resolve", async () => {
  const targets = [...readme.matchAll(/(?:\[[^\]]*\]\(|<img[^>]+src=")([^" )#]+)(?:#[^" )]+)?/g)]
    .map((match) => match[1])
    .filter((target) => !/^[a-z]+:/i.test(target))
  assert.ok(targets.includes("docs/assets/curiosity-architecture.svg"))
  for (const target of targets) await access(new URL(target, root))
})
