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
const commandRows = {
  "curiosity-deliver-change": ["Deliver an outcome.", "/curiosity-deliver-change export"],
  "curiosity-bug": ["Repair a reproduced defect.", "/curiosity-bug duplicated tax"],
  "curiosity-feature": ["Add an approved capability.", "/curiosity-feature saved filters"],
  "curiosity-deep-research": ["Research without edits.", "/curiosity-deep-research queue choice"],
  "curiosity-architecture": ["Choose a design.", "/curiosity-architecture cache owner"],
  "curiosity-spec": ["Persist a pre-write spec.", "/curiosity-spec export criteria"],
  "curiosity-implement": ["Implement an approved package.", "/curiosity-implement account-export@r0001 <contract_sha256>"],
  "curiosity-review": ["Independently review evidence.", "/curiosity-review current diff"],
  "curiosity-secure": ["Assess a threat or fix.", "/curiosity-secure uploads"],
  "curiosity-verify": ["Audit checks without edits.", "/curiosity-verify current change"],
  "curiosity-ledger": ["Show or persist the ledger.", "/curiosity-ledger active changes"],
  "curiosity-close": ["Validate and archive a package.", "/curiosity-close export"],
}

test("README has the concise interview-ready shape", () => {
  const words = readme.match(/\b[\p{L}\p{N}][\p{L}\p{N}’'./*-]*\b/gu) ?? []
  const lines = readme.trimEnd().split("\n")
  assert.ok(words.length >= 430 && words.length <= 500, `word count: ${words.length}`)
  assert.ok(lines.length >= 50 && lines.length <= 75, `line count: ${lines.length}`)
  assert.deepEqual(readme.match(/^# .+$/gm), ["# Curiosity for Cursor"])
  assert.equal((readme.match(/^```(?:\w+)?$/gm) ?? []).length, 2, "exactly one fenced block")
  assert.match(lines.slice(0, 5).join("\n"), /curiosity-hero\.svg/)
  const install = readme.indexOf("## Install with Cursor Agent")
  const choose = readme.indexOf("## Choose a command")
  const guarantees = readme.indexOf("## What write commands guarantee")
  const trust = readme.indexOf("## Trust boundary")
  const docs = readme.indexOf("## Docs")
  assert.ok(install > 0 && install < choose && choose < guarantees && guarantees < trust && trust < docs)
})

test("README states product facts and resolves the command inventory", () => {
  assert.match(readme, /Cursor-only/i)
  assert.match(readme, /v0\.8\.0/)
  assert.match(readme, /public MIT|MIT-licensed/i)
  assert.match(readme, /4 agents.*5 skills.*12 commands.*1 rule/is)
  for (const command of commands) assert.match(readme, new RegExp(`/${command}\\b`), command)
  const table = readme.match(/## Choose a command\n([\s\S]*?)(?=\n## )/)?.[1] ?? ""
  assert.equal(table.split("\n").filter((line) => /^\| [^|]+ \| `\/curiosity-/.test(line)).length, 12)
  for (const [command, [description, example]] of Object.entries(commandRows)) {
    const row = table.split("\n").find((line) => line.includes(`\`/${command}\``)) ?? ""
    assert.ok(row.includes(`| ${description} | \`${example}\` |`), `${command} semantics and example`)
  }
})

test("README scopes mutation evidence guarantees by route", () => {
  const guarantees = readme.match(/## What write commands guarantee\n([\s\S]*?)(?=\n## )/)?.[1] ?? ""
  assert.match(guarantees, /every mutation route[^.]*approved persisted spec[^.]*one writer[^.]*evidence[^.]*independent review/i)
  assert.match(guarantees, /source\/behavior changes[^.]*intended RED\/GREEN[^.]*all available project-owned required full checks/i)
  assert.match(guarantees, /spec\/ledger\/archive persistence[^.]*structural[^.]*identity[^.]*digest[^.]*package\/ledger parity[^.]*idempotency checks/i)
})

test("README setup is Cursor-native and dependency-free for users", () => {
  const setup = readme.match(/## Install with Cursor Agent\n([\s\S]*?)(?=\n## )/)?.[1] ?? ""
  assert.match(setup, /repository already open in Cursor/i)
  assert.match(setup, /exactly.*manifest.*referenced/is)
  assert.match(setup, /~\/\.cursor\/plugins\/local\/(?:<plugin>|curiosity-cursor-plugin)/i)
  assert.match(setup, /(?:explicit|owner) (?:owner )?(?:permission|authorization|approval)[^\n]*before[^\n]*outside (?:the )?(?:workspace|repository|project)/i)
  assert.match(setup, /Cursor (?:IDE )?Agent[^\n]*(?:copy|file)/i)
  assert.match(setup, /reload Cursor/i)
  assert.match(setup, /fresh (?:IDE )?Agent chat/i)
  assert.match(setup, /host discovery/i)
  assert.match(setup, /static files[^\n]*do not prove discovery/i)
  assert.match(setup, /4 agents.*5 skills.*12 commands.*1 rule/is)
  for (const command of commands) assert.match(setup, new RegExp(`/${command}\\b`), command)
  assert.match(setup, /(?:do not|no) (?:run|use) Node.*Bun.*npm.*npx.*OpenSpec CLI.*hooks.*MCP.*installer/is)
  const prompt = setup.match(/```text\n([\s\S]*?)\n```/)?.[1] ?? ""
  assert.match(prompt, /\/curiosity-deliver-change <describe the outcome you want>$/)
  assert.doesNotMatch(readme, /Customize|--plugin-dir|Agent CLI|\bnpm (?:i|install)\b|\bbun install\b/i)
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
  assert.ok(targets.includes("docs/assets/curiosity-hero.svg"))
  assert.ok(targets.length >= 5)
  assert.ok(targets.every((target) => !target.startsWith("/")), "all local links are relative")
  for (const target of targets) await access(new URL(target, root))
})
