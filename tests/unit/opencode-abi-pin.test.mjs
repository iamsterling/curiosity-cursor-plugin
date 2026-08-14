import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const expected = "0.0.0-next-17430"
const json = async (relative) =>
  JSON.parse((await readFile(new URL(relative, import.meta.url), "utf8")).replace(/,\s*([}\]])/gu, "$1"))

test("OpenCode host, plugin SDK, installed packages, and lockfile share the reviewed ABI pin", async () => {
  const [pkg, lock, plugin, cli, realHost] = await Promise.all([
    json("../../package.json"),
    json("../../bun.lock"),
    json("../../node_modules/@opencode-ai/plugin/package.json"),
    json("../../node_modules/@opencode-ai/cli/package.json"),
    readFile(new URL("../../src/platform/real-host/index.ts", import.meta.url), "utf8"),
  ])

  assert.equal(pkg.dependencies["@opencode-ai/plugin"], expected)
  assert.equal(pkg.devDependencies["@opencode-ai/cli"], expected)
  assert.equal(lock.workspaces[""].dependencies["@opencode-ai/plugin"], expected)
  assert.equal(lock.workspaces[""].devDependencies["@opencode-ai/cli"], expected)
  assert.equal(plugin.version, expected)
  assert.equal(cli.version, expected)
  assert.match(realHost, new RegExp(`PINNED_REAL_HOST_VERSION = ${JSON.stringify(expected)}`))
})
