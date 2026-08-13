import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { buildProvenance } from "../../tools/provenance-manifest.mjs"

test("provenance includes untracked runtime sources and rejects a stale manifest after one changes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "opencode2-provenance-"))
  try {
    await Promise.all([
      cp("src", path.join(root, "src"), { recursive: true }),
      cp("dist", path.join(root, "dist"), { recursive: true }),
      ...["package.json", "bun.lock", "tsconfig.json", "tsconfig.build.json"].map((file) => cp(file, path.join(root, file))),
    ])
    execFileSync("git", ["init", "--quiet"], { cwd: root })
    execFileSync("git", ["add", "src", "package.json", "bun.lock", "tsconfig.json", "tsconfig.build.json"], { cwd: root })
    const before = await buildProvenance(root)
    assert.ok(before.inputs.some(({ file }) => file === "src/plugin/lifecycle.ts"))
    assert.ok(before.inputs.some(({ file }) => file === "src/platform/real-host/index.ts"))
    assert.ok(before.inputs.some(({ file }) => file === "src/features/handoff/compiler.mjs"))

    const target = path.join(root, "src/plugin/untracked-runtime.ts")
    await writeFile(target, "export const runtimeValue = 'one'\n")
    const after = await buildProvenance(root)
    assert.notEqual(after.inputDigest, before.inputDigest)
    assert.ok(after.inputs.some(({ file }) => file === "src/plugin/untracked-runtime.ts"))

    const staleArtifactManifest = after
    await writeFile(target, "export const runtimeValue = 'two'\n")
    const rebuiltManifest = await buildProvenance(root)
    assert.throws(
      () => assert.deepEqual(staleArtifactManifest, rebuiltManifest),
      /Expected values to be strictly deep-equal/u,
      "stale artifact verification must fail until rebuild records the new provenance",
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
