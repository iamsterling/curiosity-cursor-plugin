import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import { promises as fs } from "node:fs"
import test from "node:test"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const root = new URL("../", import.meta.url)
const packageJson = JSON.parse(await fs.readFile(new URL("package.json", root), "utf8"))
const daemonSource = await fs.readFile(new URL("scripts/loopd.mjs", root), "utf8")
const installerSource = await fs.readFile(new URL("scripts/install-node.mjs", root), "utf8")
const workflow = await fs.readFile(new URL(".github/workflows/ci.yml", root), "utf8")

test("package binaries use only the new identity", () => {
  assert.deepEqual(packageJson.bin, {
    "opencode2-config": "scripts/install-node.mjs",
    "opencode2-configd": "scripts/loopd.mjs",
  })
})

test("daemon has no legacy identity in environment, diagnostics, defaults, or help", async () => {
  assert.doesNotMatch(daemonSource, /OPENCODE_LOOPD_/)
  assert.doesNotMatch(daemonSource, /opencode-loopd/)
  assert.doesNotMatch(daemonSource, /OpenCodeLoop/)
  assert.match(daemonSource, /OPENCODE2_CONFIGD_FAILED_RUN_RETRY_MS/)
  assert.match(daemonSource, /OpenCode2Config/)
  const { stdout } = await execFileAsync(process.execPath, ["scripts/loopd.mjs", "--help"], { cwd: new URL(".", root).pathname })
  assert.match(stdout, /opencode2-configd/)
  assert.doesNotMatch(stdout, /opencode-loopd|OpenCodeLoop/)
})

test("installer uses the new identity for its binary, plugin path, and diagnostics", () => {
  assert.doesNotMatch(installerSource, /opencode-loop(?:\.ts|\.js|\b)/)
  assert.match(installerSource, /opencode2-config(?:\.ts|\.js|\b)/)
  assert.match(installerSource, /OpenCode2Config/)
})

test("third-party CI actions are pinned to immutable commit SHAs", () => {
  for (const line of workflow.split("\n").filter((value) => value.includes("uses:"))) {
    assert.match(line, /@[0-9a-f]{40}\s+#\s+v\d+(?:\.\d+(?:\.\d+)?)?$/)
  }
})
