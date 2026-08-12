import assert from "node:assert/strict"
import test from "node:test"
import { diagnose } from "../../dist/platform/doctor/index.js"

const healthy = {
  pluginApiVersion: "0.0.0-next-17125", hostVersion: "0.0.0-next-17125", setupCount: 1,
  agents: { orchestrator: { enabled: true, model: "provider/model" } }, defaultAgent: "orchestrator",
  subagentDepth: 3, hooks: ["session.context", "tool.execute.before", "tool.execute.after", "event.subscribe"],
  directShellDetected: false, writerState: "healthy", featureIDs: ["hook-foundation", "structured-tools"],
  routeIDs: ["orchestrator"], resourceDrift: [], stateStatus: "healthy",
}

test("doctor covers compatibility, writers, hooks, features, routes, depth, drift, state, shell, and resources", () => {
  const codes = diagnose({ ...healthy, pluginApiVersion: "bad", writerState: "contended", hooks: [], featureIDs: ["hook-foundation"], routeIDs: [], subagentDepth: 1, resourceDrift: ["agents/reviewer.json"], stateStatus: "corrupt", directShellDetected: true }).map((item) => item.code)
  for (const code of ["DOCTOR_PLUGIN_API_PIN_MISMATCH", "DOCTOR_WRITER_UNHEALTHY", "DOCTOR_HOOK_MISSING", "DOCTOR_FEATURE_MISSING", "DOCTOR_ROUTE_MISSING", "DOCTOR_SUBAGENT_DEPTH_UNPROVEN", "DOCTOR_RESOURCE_DRIFT", "DOCTOR_STATE_CORRUPT", "DOCTOR_DIRECT_SHELL_PROHIBITED"]) assert.ok(codes.includes(code), code)
})

test("doctor labels observational failures fail-open and material failures fail-closed", () => {
  const diagnostics = diagnose({ ...healthy, observationErrors: ["host-history"], materialErrors: ["ledger-corrupt"] })
  assert.ok(diagnostics.some((item) => item.code === "DOCTOR_OBSERVATION_UNAVAILABLE" && item.severity === "warning"))
  assert.ok(diagnostics.some((item) => item.code === "DOCTOR_MATERIAL_AUTHORITY_BLOCKED" && item.severity === "error"))
})
