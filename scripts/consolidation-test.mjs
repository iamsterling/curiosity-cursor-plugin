import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"
import test from "node:test"

const root = path.resolve(import.meta.dirname, "..")
const manifestPath = path.join(root, "provenance/manifests/generic-consolidation-2026-08-11.json")
const hash = async (target) => createHash("sha256").update(await fs.readFile(target)).digest("hex")

test("consolidation manifest has valid treatments and every authored destination exists", async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"))
  const treatments = new Set(["imported", "adapted", "excluded-generated", "excluded-stale", "deferred-failed"])
  assert.ok(manifest.entries.length >= 80)
  for (const entry of manifest.entries) {
    assert.ok(treatments.has(entry.treatment), entry.treatment)
    assert.ok(entry.sourcePath && entry.sourceHash, entry.sourcePath)
    if (["imported", "adapted"].includes(entry.treatment)) {
      assert.ok(entry.destinationPath && entry.destinationHash, entry.destinationPath)
      await fs.access(path.join(root, entry.destinationPath))
    }
  }
})

test("all generic command, skill, and agent assets are represented", async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"))
  const destinations = new Set(manifest.entries.map((entry) => entry.destinationPath).filter(Boolean))
  for (const role of ["orchestrator", "generalist", "analyst", "implementer", "strategist", "reviewer", "researcher", "worker", "build", "plan"]) assert.ok(destinations.has(`config/agents/${role}.json`), role)
  for (const skill of ["handoff-compiler", "deep-research", "competitive-analysis", "reverse-engineering", "review", "verify", "goal-loop"]) assert.ok([...destinations].some((item) => item === `skills/${skill}/SKILL.md` || item === `skills/${skill}`), skill)
  for (const command of ["compile-handoff", "task", "verify", "review", "goal", "research", "landscape", "teardown"]) assert.ok(destinations.has(`commands/${command}.md`), command)
})

test("manifest itself contains no secret values", async () => {
  const text = await fs.readFile(manifestPath, "utf8")
  assert.doesNotMatch(text, /(?:sk-[A-Za-z0-9]{20,}|BEGIN (?:RSA |EC )?PRIVATE KEY)/)
  assert.match(await hash(manifestPath), /^[a-f0-9]{64}$/)
})
