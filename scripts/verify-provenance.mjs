import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { promises as fs } from "node:fs"

const root = new URL("../", import.meta.url)
const stages = [
  ["chore: import opencode-loop baseline at 925b599", "provenance/manifests/baseline-925b599.json"],
  ["chore: import OpenCode 2 conversion snapshot", "provenance/manifests/opencode2-dirty-snapshot.json"],
]
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex")

for (const [subject, manifestPath] of stages) {
  const matches = execFileSync("git", ["log", "--all", "--format=%H%x00%s"], { cwd: root, encoding: "utf8" })
    .trim().split("\n").map((line) => line.split("\0")).filter(([, value]) => value === subject)
  assert.equal(matches.length, 1, `expected one commit named ${subject}`)
  const commit = matches[0][0]
  const manifest = JSON.parse(await fs.readFile(new URL(manifestPath, root), "utf8"))
  assert.equal(manifest.schemaVersion, 1)
  for (const file of manifest.files) {
    const imported = execFileSync("git", ["show", `${commit}:${file.repositoryPath}`], { cwd: root, encoding: null, maxBuffer: 20_000_000 })
    assert.equal(sha256(imported), file.sha256, `${subject}:${file.repositoryPath}`)
  }
}
const patch = await fs.readFile(new URL("provenance/evidence/dirty-tracked.patch", root))
assert.equal(sha256(patch), "d0a0bd3fdefb0b12d6c8a46c4e7f8f6ff104661178b319db337795101a0142d4")
console.log("Provenance manifests and dirty patch verified")
