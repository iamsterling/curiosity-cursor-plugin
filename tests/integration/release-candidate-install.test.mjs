import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { createReleaseManifest } from "../../dist/platform/release/index.js"
import { installStagedRelease, rollbackStagedRelease } from "../../dist/platform/install/index.js"

const fixture = async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "opencode2-release-"))
  const source = path.join(root, "compiled")
  const config = path.join(root, "config")
  await mkdir(source, { recursive: true })
  await mkdir(path.join(config, "commands"), { recursive: true })
  await mkdir(path.join(root, "project", ".opencode", "opencode2-config", "ledger", "v1"), { recursive: true })
  await writeFile(path.join(source, "index.js"), "export default { id: 'test' }\n")
  await writeFile(path.join(source, "plugin.js"), "export const plugin = true\n")
  await writeFile(path.join(config, "commands", "operator.md"), "unrelated\n")
  await writeFile(path.join(root, "project", ".opencode", "opencode2-config", "ledger", "v1", "truth.json"), "ledger\n")
  return { root, source, config }
}

test("manifest-only compiled ESM install preserves unrelated files and records one hashed load path", async () => {
  const { root, source, config } = await fixture()
  try {
    const manifest = await createReleaseManifest({ source, files: ["index.js", "plugin.js"], entry: "index.js" })
    const receipt = await installStagedRelease({ configRoot: config, source, manifest })
    assert.equal(receipt.loadPaths.length, 1)
    assert.equal(receipt.loadPaths[0], "plugins/opencode2-config.js")
    assert.equal(receipt.files.length, 2)
    assert.match(await readFile(path.join(config, "plugins", "opencode2-config.js"), "utf8"), /dist\/index\.js/)
    assert.equal(await readFile(path.join(config, "commands", "operator.md"), "utf8"), "unrelated\n")
    assert.equal(await readFile(path.join(root, "project", ".opencode", "opencode2-config", "ledger", "v1", "truth.json"), "utf8"), "ledger\n")
  } finally { await rm(root, { recursive: true, force: true }) }
})

test("interrupted update restores the previous staged release and explicit rollback preserves ledger", async () => {
  const { root, source, config } = await fixture()
  try {
    const first = await createReleaseManifest({ source, files: ["index.js", "plugin.js"], entry: "index.js" })
    await installStagedRelease({ configRoot: config, source, manifest: first })
    await writeFile(path.join(source, "index.js"), "export default { id: 'updated' }\n")
    const second = await createReleaseManifest({ source, files: ["index.js", "plugin.js"], entry: "index.js" })
    await assert.rejects(
      () => installStagedRelease({ configRoot: config, source, manifest: second, fault: "before-commit" }),
      { code: "RELEASE_INSTALL_INTERRUPTED" },
    )
    assert.match(await readFile(path.join(config, "plugins", "opencode2-config", "dist", "index.js"), "utf8"), /'test'/)
    await installStagedRelease({ configRoot: config, source, manifest: second })
    await rollbackStagedRelease(config)
    assert.match(await readFile(path.join(config, "plugins", "opencode2-config", "dist", "index.js"), "utf8"), /'test'/)
    assert.equal(await readFile(path.join(root, "project", ".opencode", "opencode2-config", "ledger", "v1", "truth.json"), "utf8"), "ledger\n")
  } finally { await rm(root, { recursive: true, force: true }) }
})

test("a second plugin wrapper causes staged installation to fail closed", async () => {
  const { root, source, config } = await fixture()
  try {
    await mkdir(path.join(config, "plugins"), { recursive: true })
    await writeFile(path.join(config, "plugins", "opencode2-config.ts"), "export {}\n")
    const manifest = await createReleaseManifest({ source, files: ["index.js", "plugin.js"], entry: "index.js" })
    await assert.rejects(() => installStagedRelease({ configRoot: config, source, manifest }), { code: "RELEASE_LOAD_PATH_DUPLICATE" })
  } finally { await rm(root, { recursive: true, force: true }) }
})

test("release rejects symlinks and derives the wrapper from the manifest entry", async () => {
  const { root, source, config } = await fixture()
  try {
    await symlink(path.join(source, "index.js"), path.join(source, "linked.js"))
    await assert.rejects(
      () => createReleaseManifest({ source, files: ["linked.js"], entry: "linked.js" }),
      { code: "RELEASE_FILE_NOT_REGULAR" },
    )
    const manifest = await createReleaseManifest({ source, files: ["plugin.js"], entry: "plugin.js" })
    await installStagedRelease({ configRoot: config, source, manifest })
    assert.match(await readFile(path.join(config, "plugins", "opencode2-config.js"), "utf8"), /dist\/plugin\.js/)
  } finally { await rm(root, { recursive: true, force: true }) }
})
