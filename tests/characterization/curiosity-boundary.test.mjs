import assert from "node:assert/strict"
import { access } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const exists = (path) => access(new URL(path, root)).then(() => true, () => false)

test("the research-phase split retains complete assets and excludes unfinished runtimes", async () => {
  for (const retained of [
    "src/features/config/agents.ts",
    "src/features/handoff/compiler.mjs",
    "src/features/hooks/event-capture.ts",
    "src/features/ledger/domain.ts",
    "src/features/ledger/archive.ts",
    "assets/commands/loop-status.md",
    "assets/commands/bug.md",
    "assets/commands/feature.md",
    "assets/commands/research.md",
    "assets/commands/secure.md",
    "assets/skills/deep-research/SKILL.md",
    "provenance/manifests/generic-consolidation-2026-08-11.json",
  ]) assert.equal(await exists(retained), true, `retained boundary missing ${retained}`)

  for (const removed of [
    "src/features/loop-engine",
    "src/features/ledger/index.ts",
    "src/features/tools/index.ts",
    "src/features/orchestration/index.ts",
    "src/features/engineering-intent",
    "src/features/external-records",
    "src/features/local-effects",
    "docs/research/graph-engineering.md",
  ]) assert.equal(await exists(removed), false, `unfinished boundary retained ${removed}`)
})
