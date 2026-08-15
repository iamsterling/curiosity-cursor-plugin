import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const manifest = JSON.parse(await readFile(new URL("../../assets/manifest.json", import.meta.url), "utf8"))

test("every loop compatibility command has one explicit non-native disposition", () => {
  const commands = manifest.assets.filter((asset) => asset.kind === "command" && asset.id.startsWith("loop"))
  assert.ok(commands.length > 0)
  for (const command of commands) {
    assert.match(command.compatibilityDisposition, /^(manual-guidance|unsupported):[A-Za-z0-9_./-]+$/)
  }
  assert.equal(new Set(commands.map((command) => command.id)).size, commands.length)
})

test("runtime compatibility is fail-closed while compaction remains manual", () => {
  const dispositions = Object.fromEntries(manifest.assets.map((asset) => [asset.id, asset.compatibilityDisposition]))
  assert.equal(dispositions["loop-shell"], "unsupported:CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED")
  assert.equal(dispositions["loop-status"], "unsupported:CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED")
  assert.equal(dispositions["loop-progress"], "unsupported:CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED")
  assert.equal(dispositions["loop-compact"], "manual-guidance:HOST_COMPACTION_CONTROL")
})
