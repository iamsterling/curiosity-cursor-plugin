import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

const root = process.cwd()
const baseline = "74fe8c5"
const prompt = async (file) => JSON.parse(await readFile(path.join(root, file), "utf8")).system ?? ""
const oldPrompt = (file) => JSON.parse(execFileSync("git", ["show", `${baseline}:${file.replace(/^assets\//, "")}`], { cwd: root, encoding: "utf8" })).system ?? ""

test("agent prompt source bytes are lower than the preserved baseline", async () => {
  const files = (await readdir(path.join(root, "assets/config/agents"))).filter((name) => name.endsWith(".json"))
  const current = (await Promise.all(files.map((name) => prompt(`assets/config/agents/${name}`)))).join("")
  const previous = files.map((name) => oldPrompt(`assets/config/agents/${name}`)).join("")
  assert.ok(Buffer.byteLength(current) < Buffer.byteLength(previous), `${Buffer.byteLength(current)} must be below ${Buffer.byteLength(previous)}`)
})

test("reviewer is a mechanical findings allowlist without rationale or suspected-defect prose", async () => {
  const system = await prompt("assets/config/agents/reviewer.json")
  assert.match(system, /allowlist/i)
  assert.doesNotMatch(system, /rationale|suspect(?:ed)? defects?/i)
  assert.match(system, /file:line|stable category/i)
})

test("research keeps bounded curiosity semantics and rejects live autonomous curiosity", async () => {
  const researcher = await prompt("assets/config/agents/researcher.json")
  assert.match(researcher, /curiosity/i)
  assert.match(researcher, /CURIOSITY_NO_GO/)
  assert.match(researcher, /no live autonomous curiosity/i)
})

test("command and help inventory is filesystem-generatable", async () => {
  const commands = (await readdir(path.join(root, "assets/commands"))).filter((name) => name.endsWith(".md")).sort()
  assert.ok(commands.includes("loop-help.md"))
  assert.equal(new Set(commands.map((name) => name.slice(0, -3))).size, commands.length)
  for (const name of commands) assert.match(await readFile(path.join(root, "assets/commands", name), "utf8"), /^---\n/)
})
