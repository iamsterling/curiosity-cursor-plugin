import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import test from "node:test"

const execute = promisify(execFile)

test("isolated opencode2 serve probe times out and cleans its process group", async () => {
  const { stdout } = await execute("node", ["tools/real-host-suite.mjs"], { cwd: process.cwd(), timeout: 10_000 })
  const result = JSON.parse(stdout)
  if (!result.supported) return
  assert.equal(result.orphaned, false)
  assert.equal(result.topLevelWrites.sort().join(","), "cache,config,data,home,project")
  assert.doesNotMatch(result.output, /server password\s+(?!\[REDACTED\])/i)
  assert.ok(result.unsupported.some((item) => item.startsWith("child-lineage:")))
})
