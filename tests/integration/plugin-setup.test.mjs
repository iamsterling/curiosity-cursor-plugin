import assert from "node:assert/strict"
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import plugin from "../../dist/index.js"

const contextFor = (directory, log, definitions) => {
  const registration = (id) => {
    log.push(`register:${id}`)
    return { dispose: async () => log.push(`dispose:${id}`) }
  }
  return {
    app: { name: "opencode2", version: "0.0.0-next-17430", channel: "next" },
    options: { directory },
    agent: {
      transform: async (callback) => {
        callback({
          default: (id) => definitions.set("agent:default", id),
          update: (id, update) => {
            const agent = { id, name: id, request: { settings: {}, headers: {}, body: {} }, mode: "primary", hidden: false, permissions: [] }
            update(agent)
            definitions.set(`agent:${id}`, agent)
          },
        })
        return registration("agent:transform")
      },
    },
    session: { hook: async (id, callback) => { definitions.set(`session:${id}`, callback); return registration(`session:${id}`) } },
    tool: {
      hook: async (id, callback) => { definitions.set(`tool:${id}`, callback); return registration(`tool:${id}`) },
      transform: async () => { throw new Error("RUNTIME_TOOL_REGISTRATION_FORBIDDEN") },
    },
    event: { subscribe: ({ signal }) => ({ async *[Symbol.asyncIterator]() { await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true })) } }) },
  }
}

test("setup retains agent routing and generic capture hooks without lifecycle tools", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "curiosity-plugin-setup-"))
  const log = []
  const definitions = new Map()
  try {
    const cleanup = await plugin.setup(contextFor(directory, log, definitions))
    assert.equal(definitions.get("agent:default"), "orchestrator")
    assert.equal(definitions.get("agent:orchestrator").mode, "primary")
    for (const id of ["analyst", "generalist", "implementer", "researcher", "reviewer", "strategist", "worker"])
      assert.equal(definitions.get(`agent:${id}`).mode, "subagent", id)
    assert.deepEqual(log.filter((entry) => entry.startsWith("register:")), [
      "register:agent:transform", "register:tool:execute.before", "register:tool:execute.after",
    ])
    const canary = "PRIVATE-TOOL-CANARY-7d91"
    await definitions.get("tool:execute.before")({ tool: "read", sessionID: "session", messageID: "message", agent: "test", id: "call", input: { path: canary } })
    await definitions.get("tool:execute.after")({ tool: "read", sessionID: "session", messageID: "message", agent: "test", id: "call", status: "completed", result: { content: canary } })
    const capture = path.join(directory, ".opencode/curiosity-cursor-plugin/capture/v1/events")
    const persisted = await Promise.all((await readdir(capture)).map((name) => readFile(path.join(capture, name), "utf8")))
    assert.equal(persisted.join("\n").includes(canary), false)
    await cleanup?.()
    assert.deepEqual(log.filter((entry) => entry.startsWith("dispose:")), [
      "dispose:tool:execute.after", "dispose:tool:execute.before",
    ])
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("setup rejects an unreviewed host ABI before registering behavior", async () => {
  const log = []
  const context = contextFor("/tmp/curiosity-cursor-plugin-abi-mismatch", log, new Map())
  context.app.version = "0.0.0-next-17431"
  await assert.rejects(plugin.setup(context), { code: "REAL_HOST_VERSION_PIN_MISMATCH" })
  assert.deepEqual(log, [])
})

test("duplicate setup is guarded and cleanup makes the root retryable", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "curiosity-plugin-guard-"))
  const log = []
  try {
    const first = await plugin.setup(contextFor(directory, log, new Map()))
    const duplicate = await plugin.setup(contextFor(directory, log, new Map()))
    assert.equal(log.filter((entry) => entry.startsWith("register:")).length, 3)
    await duplicate?.()
    await first?.()
    const retry = await plugin.setup(contextFor(directory, log, new Map()))
    assert.equal(log.filter((entry) => entry.startsWith("register:")).length, 6)
    await retry?.()
  } finally { await rm(directory, { recursive: true, force: true }) }
})
