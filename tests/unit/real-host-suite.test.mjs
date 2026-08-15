import assert from "node:assert/strict"
import test from "node:test"
import { capabilityReport, realHostPlatformGate } from "../../tools/real-host-suite.mjs"

test("real-host platform gate skips only Darwin sandbox subtests on unsupported hosts", () => {
  assert.deepEqual(realHostPlatformGate({ platform: "linux", sandboxAvailable: false }), {
    supported: false,
    status: "skipped",
    code: "REAL_HOST_DARWIN_SANDBOX_UNSUPPORTED_PLATFORM",
    reason: "Darwin sandbox-specific real-host subtests require macOS; platform-independent confinement tests run in test:security",
  })
  assert.throws(() => realHostPlatformGate({ platform: "darwin", sandboxAvailable: false }), /REAL_HOST_DARWIN_SANDBOX_REQUIRED/)
  assert.deepEqual(realHostPlatformGate({ platform: "darwin", sandboxAvailable: true }), { supported: true })
})

test("credential-free capability report is pinned and fail-closed for unsupported semantics", () => {
  const report = capabilityReport({ hostVersion: "0.0.0-next-17430", pluginApiVersion: "0.0.0-next-17430" })
  assert.deepEqual(report.compaction, { status: "disabled", code: "REAL_HOST_COMPACTION_UNSUPPORTED" })
  assert.deepEqual(report.childLineage, { status: "disabled", code: "REAL_HOST_CHILD_LINEAGE_UNSUPPORTED" })
  assert.equal(report.reload.code, "REAL_HOST_RELOAD_UNPROVEN")
  assert.equal(report.interrupt.code, "REAL_HOST_INTERRUPT_UNPROVEN")
  assert.equal(report.concurrentSetup.code, "REAL_HOST_WRITER_ELECTION_UNPROVEN")
  assert.deepEqual(report.authoritativePersistence, { status: "disabled", code: "PERSISTENCE_AUTOMATION_UNSUPPORTED" })
})

test("version mismatch disables every real-host capability with a stable code", () => {
  const report = capabilityReport({ hostVersion: "0.0.0-next-17276", pluginApiVersion: "0.0.0-next-17430" })
  for (const capability of Object.values(report)) assert.deepEqual(capability, { status: "disabled", code: "REAL_HOST_VERSION_PIN_MISMATCH" })
})
