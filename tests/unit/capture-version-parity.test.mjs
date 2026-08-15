import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (path) => readFile(new URL(path, root), "utf8")

test("capture producer version matches package and Cursor manifests", async () => {
  const packageVersion = JSON.parse(await read("package.json")).version
  const cursorVersion = JSON.parse(await read(".cursor-plugin/plugin.json")).version
  const hooksSource = await read("src/features/hooks/open-code-hooks.ts")
  const captureVersion = hooksSource.match(/EventCapture\.open\([^\n]+pluginVersion: "([^"]+)"/)?.[1]

  assert.equal(packageVersion, "0.3.2")
  assert.equal(cursorVersion, packageVersion)
  assert.equal(captureVersion, packageVersion)
})
