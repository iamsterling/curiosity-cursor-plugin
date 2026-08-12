import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { plugin } from "../../dist/index.js"

test("two setup calls register one hook and tool writer", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "plugin-setup-"))
  let registrations = 0
  const registration = async () => ({ dispose: async () => {} })
  const context = {
    app: { name: "opencode2", version: "0.0.0-next-17276", channel: "next" },
    options: { directory },
    session: { hook: async () => { registrations++; return registration() }, prompt: async () => {}, interrupt: async () => {} },
    tool: { hook: async () => { registrations++; return registration() }, transform: async () => { registrations++; return registration() } },
    event: { subscribe: ({ signal }) => ({ async *[Symbol.asyncIterator]() { await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true })) } }) },
  }
  try {
    const cleanup1 = await plugin.setup(context)
    const cleanup2 = await plugin.setup(context)
    assert.equal(registrations, 4)
    await cleanup2?.()
    await cleanup1?.()
  } finally { await rm(directory, { recursive: true, force: true }) }
})
