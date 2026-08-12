import assert from "node:assert/strict"
import { promises as fs } from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "../..")
const read = (value) => fs.readFile(path.join(root, value), "utf8")

const loopCommands = ["loop","loop-ask","loop-clear","loop-cmd","loop-command","loop-compact","loop-dev","loop-doctor","loop-export","loop-goal","loop-goal-blocked","loop-goal-clear","loop-goal-done","loop-goal-pause","loop-goal-resume","loop-goal-status","loop-help","loop-init","loop-logs","loop-now","loop-pause","loop-progress","loop-prompt","loop-remove","loop-resume","loop-safe-dev","loop-shell","loop-status","loop-stop","loop-testfix"]

test("compatibility command IDs, markers, and local agent stay exact", async () => {
  const agent = await read("agents/opencode-loop-local.md")
  assert.match(agent, /mode:\s*primary/)
  assert.match(agent, /"\*": deny/)
  assert.match(agent, /Reply exactly: OK/)
  for (const id of loopCommands) {
    const command = await read(`commands/${id}.md`)
    assert.match(command, /agent:\s*opencode-loop-local/)
    assert.match(command, new RegExp(`\\[opencode-loop:${id}\\]`))
  }
  assert.match(await read("commands/loop-goal-done.md"), /--manual-override/)
})

test("plugin and goal tool IDs stay exact", async () => {
  const runtime = await read("src/index.js")
  assert.match(runtime, /iamsterling\.opencode2-config/)
  for (const id of ["opencode_loop_goal_complete", "opencode_loop_goal_blocked", "opencode_loop_goal_progress"]) assert.match(runtime, new RegExp(id))
})

test("legacy daemon argv remains shell-free and compatibility-only behavior is pinned", async () => {
  const daemon = await read("scripts/loopd.mjs")
  assert.match(daemon, /\["run", "--continue"/)
  assert.match(daemon, /shell:\s*false/)
  assert.match(daemon, /OPENCODE2_CONFIGD_FAILED_RUN_RETRY_MS/)
})
