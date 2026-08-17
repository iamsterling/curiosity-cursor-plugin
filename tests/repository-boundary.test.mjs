import assert from "node:assert/strict"
import { spawnSync, execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { lstat, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import Ajv from "ajv"

const root = new URL("../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const tracked = () => execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter((file) => existsSync(new URL(file, root)))
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex")
const expected = {
  agents: ["agents/curiosity-strategist.md", "agents/curiosity-reviewer.md", "agents/curiosity-researcher.md", "agents/curiosity-implementer.md"],
  skills: [
    "skills/curiosity-implementation-discipline",
    "skills/curiosity-architecture-awareness",
    "skills/curiosity-decision-design",
    "skills/curiosity-research-evidence",
    "skills/curiosity-independent-review",
  ],
  commands: [
    "commands/curiosity-deliver-change.md",
    "commands/curiosity-bug.md",
    "commands/curiosity-feature.md",
    "commands/curiosity-deep-research.md",
    "commands/curiosity-review.md",
    "commands/curiosity-secure.md",
    "commands/curiosity-verify.md",
    "commands/curiosity-architecture.md",
    "commands/curiosity-spec.md",
    "commands/curiosity-ledger.md",
    "commands/curiosity-implement.md",
    "commands/curiosity-close.md",
  ],
  rules: ["rules/curiosity-delivery.mdc"],
}

test("0.8.0 manifest is schema-valid and has the exact file-only surface", async () => {
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  const pkg = JSON.parse(await read("package.json"))
  assert.equal(manifest.version, "0.8.0")
  assert.equal(pkg.version, manifest.version)
  assert.equal(new Ajv({ allErrors: true }).compile(JSON.parse(await read("provenance/cursor/plugin.schema.2a804442.json")))(manifest), true)
  for (const [kind, files] of Object.entries(expected)) assert.deepEqual(manifest[kind], files)
  assert.deepEqual(pkg.dependencies, undefined)
  for (const field of ["main", "exports", "types", "bin", "files"]) assert.equal(pkg[field], undefined, field)
})

test("current repository contains no retired runtime or compatibility surface", () => {
  const files = tracked()
  const prohibitedRoots = /^(?:src|assets|examples|hooks|dist)\//
  assert.deepEqual(files.filter((file) => prohibitedRoots.test(file)), [])
  assert.deepEqual(files.filter((file) => /^(?:biome\.json|eslint\.config\.js|tsconfig[^/]*\.json|mcp\.json)$/.test(file)), [])
  assert.deepEqual(files.filter((file) => /(?:^|\/)(?:install(?:er)?[^/]*|bundle-assets|make-zip|real-host|staged-release|check-opencode-abi|verify-artifact|write-build-provenance)[^/]*\.(?:mjs|js|sh|ps1)$/i.test(file)), [])
})

test("active authority inventory is public Cursor-only and has no compatibility claims", async () => {
  const active = [
    ".cursor-plugin/plugin.json",
    ".github/workflows/ci.yml",
    "AGENTS.md",
    "CHANGELOG.md",
    "README.md",
    "agents/curiosity-researcher.md",
    "agents/curiosity-reviewer.md",
    "agents/curiosity-strategist.md",
    "agents/curiosity-implementer.md",
    "commands/curiosity-deliver-change.md",
    "commands/curiosity-bug.md",
    "commands/curiosity-feature.md",
    "commands/curiosity-deep-research.md",
    "commands/curiosity-review.md",
    "commands/curiosity-secure.md",
    "commands/curiosity-verify.md",
    "commands/curiosity-architecture.md",
    "commands/curiosity-spec.md",
    "commands/curiosity-ledger.md",
    "commands/curiosity-implement.md",
    "commands/curiosity-close.md",
    "docs/architecture/README.md",
    "docs/architecture/current-state.md",
    "docs/decisions/0027-cursor-only-product-boundary.md",
    "docs/decisions/0028-hierarchical-context-preservation.md",
    "docs/decisions/0029-bounded-curiosity-as-foundational-policy.md",
    "docs/decisions/0030-role-authority-and-composable-expertise.md",
    "docs/decisions/0031-command-oriented-routing-fallback.md",
    "docs/decisions/0032-file-only-change-lifecycle.md",
    "docs/decisions/0033-integrated-immutable-spec-before-write.md",
    "docs/installation-architecture.md",
    "docs/migration/0.5.0-cursor-only.md",
    "docs/migration/0.6.0-role-skills.md",
    "docs/migration/0.7.0-command-routing.md",
    "docs/migration/0.8.0-change-lifecycle.md",
    "docs/provenance.md",
    "docs/provenance/README.md",
    "docs/provenance/cursor-usage-analysis-2026-08-16.md",
    "docs/research/README.md",
    "docs/research/role-authority-and-composable-expertise-2026-08-16.md",
    "docs/specs/vanilla-cursor-native-orchestration.md",
    "docs/testing/cursor-live-smoke-plan.md",
    "docs/testing/behavioral-evals.md",
    "package.json",
    "provenance/cursor/README.md",
    "provenance/cursor/role-skill-architecture-sources.json",
    "provenance/evidence/README.md",
    "provenance/manifests/README.md",
    "rules/curiosity-delivery.mdc",
    "skills/curiosity-implementation-discipline/SKILL.md",
    "skills/curiosity-architecture-awareness/SKILL.md",
    "skills/curiosity-decision-design/SKILL.md",
    "skills/curiosity-research-evidence/SKILL.md",
    "skills/curiosity-independent-review/SKILL.md",
  ]
  const candidates = tracked().filter((file) => /^(?:(?:README|CHANGELOG|AGENTS)\.md|(?:agents|commands|rules|skills)\/.*|docs\/(?:architecture|decisions|migration|specs|testing|research)\/.*|docs\/(?:installation-architecture|provenance)\.md|docs\/provenance\/(?:README|cursor-usage-analysis-2026-08-16)\.md|provenance\/(?:evidence|manifests)\/README\.md|provenance\/cursor\/(?:README\.md|role-skill-architecture-sources\.json)|package\.json|\.cursor-plugin\/plugin\.json|\.github\/workflows\/ci\.yml)$/.test(file))
  assert.deepEqual(candidates.sort(), active.toSorted(), "update the explicit active-authority inventory")
  const forbidden = /(?:private (?:plugin|repository|git)|(?:plugin|repository|git) (?:is|remains|stays) private|additive|OpenCode-backed|OpenCode (?:foundation|surface|coexists|separation)|\/loop-\*|Loop-compatible|\/loop-[^\n.]{0,40}compatib|compatib[^\n.]{0,40}\/loop-)/i
  for (const file of active) {
    for (const [index, line] of (await read(file)).split("\n").entries()) {
      const usageAnalysis = file === "docs/provenance/cursor-usage-analysis-2026-08-16.md"
      if (!forbidden.test(line) && !(usageAnalysis && /opencode2?/i.test(line))) continue
      const npmInterlock = (file === "package.json" && /"private": true/.test(line)) || (file === "README.md" && /npm publication interlock/i.test(line))
      const migrationHistory = /^(?:docs\/(?:migration|decisions)\/)/.test(file) && /former|supersed|historical|remove|retire|no .+ remain/i.test(line)
      const usageAnalysisMethod = usageAnalysis && /(?:read-only aggregate OpenCode V2 API scan|^\| \d+ \| [^|]*opencode[^|]* \||official OpenCode V2 CLI\/API client|^opencode2 )/i.test(line)
      const provenanceHistory = !usageAnalysis && /^(?:docs\/provenance|docs\/research|provenance\/)/.test(file) && /historical|provenance|imported|attribution/i.test(line)
      assert.ok(npmInterlock || migrationHistory || provenanceHistory || usageAnalysisMethod, `${file}:${index + 1}: ${line}`)
    }
  }
  assert.match(await read("README.md"), /public MIT/i)
  assert.match(await read("README.md"), /npm publication interlock/i)
})

test("pre-0.5 historical relocations are complete and byte-identical", async () => {
  const manifest = JSON.parse(await read("provenance/history/pre-0.5-relocations.json"))
  assert.equal(manifest.sourceCommit, "333c4f01fc93962dab7064f1181363f159644610")
  const destinations = new Set(manifest.relocations.map(({ historicalDestination }) => historicalDestination))
  for (const required of [
    "provenance/history/docs/installation-architecture.md",
    "provenance/history/docs/specs/vanilla-cursor-native-orchestration.md",
  ]) assert.ok(destinations.has(required), required)
  for (const relocation of manifest.relocations) {
    const source = execFileSync("git", ["show", `${manifest.sourceCommit}:${relocation.originalPath}`], { cwd: root, encoding: null })
    const destination = await readFile(new URL(relocation.historicalDestination, root))
    assert.equal(relocation.sha256, sha256(source), relocation.originalPath)
    assert.deepEqual(destination, source, relocation.historicalDestination)
  }
})

test("secret scan checks textual lockfiles and credential-bearing registry URLs", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "curiosity-secret-scan-"))
  try {
    execFileSync("git", ["init", "-q"], { cwd: directory })
    const token = "gh" + "p_" + "a".repeat(24)
    const registryCredential = "https://reader:" + "password123" + "@registry.example.test/package"
    await writeFile(path.join(directory, "bun.lock"), `${token}\n${registryCredential}\n`)
    const result = spawnSync(process.execPath, [new URL("../tools/secret-scan.mjs", import.meta.url).pathname], { cwd: directory, encoding: "utf8" })
    assert.notEqual(result.status, 0, result.stdout + result.stderr)
    assert.match(result.stderr, /bun\.lock:1/)
    assert.match(result.stderr, /bun\.lock:2/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test("installed guidance uses scoped target-project dependency approval", async () => {
  const files = [
    "README.md",
    "rules/curiosity-delivery.mdc",
    "commands/curiosity-deliver-change.md",
    "skills/curiosity-implementation-discipline/SKILL.md",
    "docs/specs/vanilla-cursor-native-orchestration.md",
  ]
  for (const file of files) {
    const source = await read(file)
    for (const phrase of ["exact package", "purpose", "prod/dev", "package-manager command", "manifest", "lockfile", "stop"]) assert.match(source, new RegExp(phrase, "i"), `${file}: ${phrase}`)
    assert.match(source, /explicit user approval/i, file)
    assert.match(source, /no global install|never install globally/i, file)
    assert.match(source, /guess/i, file)
    assert.match(source, /npx/i, file)
    assert.match(source, /curl/i, file)
  }
})

test("installed assets are regular non-executable Markdown without bootstrap behavior", async () => {
  for (const relative of Object.values(expected).flat()) {
    const stat = await lstat(new URL(relative, root))
    if (stat.isDirectory()) continue
    assert.equal(stat.isSymbolicLink(), false, relative)
    assert.equal(stat.isFile(), true, relative)
    assert.ok([".md", ".mdc"].includes(path.extname(relative)), relative)
    assert.equal(stat.mode & 0o111, 0, relative)
    assert.doesNotMatch(await read(relative), /curl[^\n|]*\|\s*(?:ba|z)?sh|plugin-owned (?:runtime|SDK|package manager)/i, relative)
  }
})
