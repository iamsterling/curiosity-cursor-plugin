import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { EventCapture } from "../../dist/features/hooks/event-capture.js"
import { eventEnvelope } from "../../dist/features/hooks/open-code-hooks.js"

const open = async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "hook-foundation-"))
  return { directory, capture: await EventCapture.open(directory, { pluginVersion: "test", hostVersion: "host" }) }
}

test("strict intake distinguishes duplicate, collision, reorder, and durable gaps", async () => {
  const { directory, capture } = await open()
  try {
    const event = { id: "e1", aggregate: "session:s", sequence: 1, type: "started", sessionID: "s", sourceKind: "host", payload: { value: 1 } }
    assert.equal((await capture.ingest(event)).status, "accepted")
    assert.equal((await capture.ingest(event)).status, "duplicate")
    assert.equal((await capture.ingest({ ...event, payload: { value: 2 } })).status, "collision")
    assert.equal((await capture.ingest({ ...event, id: "e3", sequence: 3 })).status, "accepted")
    assert.deepEqual((await capture.snapshot()).gaps, [{ aggregate: "session:s", from: 2, to: 2 }])
    assert.equal((await capture.ingest({ ...event, id: "e2", sequence: 2 })).status, "reordered")
    assert.deepEqual((await capture.snapshot()).gaps, [])
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("strict intake rejects non-durable identity and sequence without writing", async () => {
  const { directory, capture } = await open()
  try {
    await assert.rejects(capture.ingest({ id: "", aggregate: "session:s", sequence: 1, type: "x", sourceKind: "host" }), { code: "CAPTURE_EVENT_ID_INVALID" })
    await assert.rejects(capture.ingest({ id: "e", aggregate: "session:s", sequence: 0, type: "x", sourceKind: "host" }), { code: "CAPTURE_SEQUENCE_INVALID" })
    assert.equal((await capture.snapshot()).events.length, 0)
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("reentrant intake serializes instead of surfacing writer contention", async () => {
  const { directory, capture } = await open()
  try {
    const base = { aggregate: "session:s", type: "x", sourceKind: "host" }
    const results = await Promise.all([
      capture.ingest({ ...base, id: "e1", sequence: 1 }),
      capture.ingest({ ...base, id: "e2", sequence: 2 }),
    ])
    assert.equal(results.every(({ status }) => ["accepted", "reordered"].includes(status)), true)
    assert.equal((await capture.snapshot()).events.length, 2)
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("tool halves expose gaps and persisted envelopes never contain raw output", async () => {
  const { directory, capture } = await open()
  try {
    await capture.ingest({ id: "tool:after", aggregate: "tool:c1", sequence: 2, type: "tool.execute.cancelled", sessionID: "s", callID: "c1", sourceKind: "tool", payload: { raw: "SECRET_OUTPUT" }, taint: "untrusted-tool" })
    const snapshot = await capture.snapshot()
    assert.deepEqual(snapshot.gaps, [{ aggregate: "tool:c1", from: 1, to: 1 }])
    assert.equal(JSON.stringify(snapshot).includes("SECRET_OUTPUT"), false)
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test("cancel and subagent events retain durable correlation without guessed identity", () => {
  const cancelled = eventEnvelope({ id: "cancel-1", type: "tool.execute.cancelled", data: { sessionID: "child", rootSessionID: "root", parentSessionID: "root", toolCallID: "call-1" } })
  assert.equal(cancelled.aggregate, "tool:call-1")
  assert.equal(cancelled.sequence, 2)
  assert.equal(cancelled.callID, "call-1")
  assert.equal(cancelled.rootSessionID, "root")
  assert.equal(cancelled.parentSessionID, "root")
  const missing = eventEnvelope({ type: "session.created", data: { sessionID: "child", parentSessionID: "root" } })
  assert.equal(missing.id, "")
  assert.ok(Number.isNaN(missing.sequence))
})
