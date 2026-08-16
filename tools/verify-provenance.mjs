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
const relocationManifestPath = "provenance/history/pre-0.5-relocations.json"
const nonRelocatedHistoryFiles = new Set([
  "provenance/history/README.md",
  "provenance/history/opencode-loop-CHANGELOG.md",
  relocationManifestPath,
])

const listFiles = async (directory, prefix = "") => {
  const entries = await fs.readdir(new URL(directory, root), { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...await listFiles(`${directory}/${entry.name}`, relative))
    else files.push(`provenance/history/${relative}`)
  }
  return files
}

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

const relocationManifest = JSON.parse(await fs.readFile(new URL(relocationManifestPath, root), "utf8"))
assert.equal(relocationManifest.schemaVersion, 1)
assert.equal(relocationManifest.sourceCommit, "333c4f01fc93962dab7064f1181363f159644610")
const historicalFiles = (await listFiles("provenance/history")).filter((file) => !nonRelocatedHistoryFiles.has(file)).sort()
const destinations = relocationManifest.relocations.map(({ historicalDestination }) => historicalDestination)
assert.equal(new Set(destinations).size, destinations.length, "historical relocation destinations must be unique")
assert.deepEqual(destinations.toSorted(), historicalFiles, "historical relocation manifest must cover every moved history file")
for (const relocation of relocationManifest.relocations) {
  assert.match(relocation.originalPath, /^(?!\/|.*(?:^|\/)\.\.(?:\/|$)).+/)
  assert.match(relocation.historicalDestination, /^provenance\/history\//)
  const source = execFileSync("git", ["show", `${relocationManifest.sourceCommit}:${relocation.originalPath}`], { cwd: root, encoding: null, maxBuffer: 20_000_000 })
  const blob = execFileSync("git", ["rev-parse", `${relocationManifest.sourceCommit}:${relocation.originalPath}`], { cwd: root, encoding: "utf8" }).trim()
  const destination = await fs.readFile(new URL(relocation.historicalDestination, root))
  assert.equal(relocation.gitBlob, `sha1:${blob}`, `${relocation.originalPath}: source blob`)
  assert.equal(relocation.sha256, sha256(source), `${relocation.originalPath}: source digest`)
  assert.deepEqual(destination, source, `${relocation.originalPath}: destination bytes`)
}

console.log(`Provenance manifests, dirty patch, and ${destinations.length} historical relocations verified`)
