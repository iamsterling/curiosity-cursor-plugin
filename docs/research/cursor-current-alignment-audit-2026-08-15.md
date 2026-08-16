# Cursor current-alignment audit — 2026-08-15

> **HISTORICAL / SUPERSEDED — NOT CURRENT PRODUCT BEHAVIOR.** [ADR 0026](../decisions/0026-vanilla-cursor-native-orchestration.md) and the normative [usage-driven Cursor-native delivery boundary](../specs/vanilla-cursor-native-orchestration.md) are authoritative. They removed the six-agent surface, writable custom agents, and command-hook mesh described below; those behaviors are not current or installed.

## Question, scope, and verdict

Historical question: did the then-current v0.4.0 Cursor surface—six agents, one engineering skill, and one stateless six-event hook mesh—match the then-documented static Cursor plugin/subagent contracts, and were its operational and CI claims bounded by evidence? The original audit question concerned the historical 0.3.0 inert-hook surface. Neither surface is the current product description.

Scope was static manifest/frontmatter validation, accidental component discovery, operator documentation, and the existing credential-free OpenCode real-host CI probe. No Cursor CLI login, model session, plugin load, installation, global configuration, cloud agent, MCP execution, or inference was performed.

The historical 0.2.0 incoming verdict was **NOT ALIGNED** because documentation and tests overstated or omitted important boundaries, although no manifest or frontmatter defect was proven. Historical Private CI run [`31901827610`](https://github.com/iamsterling/curiosity-cursor-plugin/actions/runs/31901827610) completed successfully for the 0.3.0 inert-hook commit `c8130e131b138f5b34b92708347c4329fa7ee26d`; it is not v0.4.0 mesh evidence. Later authorized evidence mostly exercised historical CLI surfaces with explicit partial results, while the editor remained unverified. The then-current v0.4.0 mesh was **statically verified only with documented runtime uncertainty**, not runtime aligned.

**0.3.2 authority correction.** Authorized live CLI evidence contradicted the prior assumption that prompt guidance could keep an evidence Todo incomplete: Cursor marked it completed and rendered `To-do All done` after the mandatory full suite exited 1. The corrected alignment claim treats native Todos as attempted-work/progress projections and introduces a separate prompt-level Verification Gate over raw mandatory evidence. F3 retesting showed the gate blocking finish and refusing an override, while semantic all-done Todo state remained and was not self-flagged. Static guidance can require contradiction reporting and block finish confirmation; it cannot prevent host state/rendering. The full available sanitized evidence summary is in [`cursor-live-smoke-2026-08-15.md`](cursor-live-smoke-2026-08-15.md).

**Historical 0.4.0 verdict.** The v0.4.0 source replaced the historical inert stop hook with one stateless command dispatcher configured only for sessionStart, subagentStart, beforeShellExecution, beforeReadFile, Shell-matched postToolUse, and preCompact. Protected events were fail-closed; guidance events were fail-open. Marked writable handoffs plus exact official `subagent_type` matching, conservative malformed protected discrimination, exact transcript-path denial, enumerated lexical shell approval, and output-blind evidence reminders were fixture-tested. Stop, generic preToolUse, prompt, MCP, and other lifecycle surfaces remained absent. Official mutable docs were independently refetched and response digests recorded. No live model or editor smoke ran for v0.4.0; historical inert-hook, CLI, and CI evidence did not validate this mesh. ADR 0026 later removed it.

## Fixed gaps

- Operator docs now separate plugin root from target workspace, record CWD as the default workspace, and warn that root `AGENTS.md` can become a workspace instruction.
- Authentication, trust prompts/saved trust, persistent ordinary account/session state, and plugin-only rollback are explicit.
- The historical v0.4.0 manifest retained the six agents introduced in 0.3.0: `/curiosity-coordinator`, `/curiosity-worker`, `/curiosity-implementer`, `/curiosity-researcher`, `/curiosity-reviewer`, and `/curiosity-strategist`. The worker and implementer were bounded writable subagents; the other four were read-only. Static declaration did not prove discovery or invocation, and automatic selection remained nondeterministic.
- `readonly: true` is bounded to the documented restriction against file edits and state-changing shell commands. It is not confidentiality, no-read, local-only processing, no-network/no-MCP, or proof of prompt compliance; version, mode, tool policy, plan, and admin controls matter.
- Manifest checks use an exact pinned official schema. YAML frontmatter uses the pinned `yaml` parser with duplicate-key diagnostics and scalar-type checks.
- Official Cursor format assertions are named separately from local product policy. Local checks cover path safety/existence, the `curiosity-` naming policy, built-in collisions (`explore`, `bash`, `browser`), and automatic-discovery exclusions (`SKILL.md`, `skills/`, `rules/`, `commands/`, `hooks/`, `hooks/hooks.json`, and `mcp.json`). Root `AGENTS.md` is explicitly a workspace instruction rather than a plugin component.
- Ubuntu CI no longer fails merely because the full real-host oracle uses Darwin `sandbox-exec`. Non-Darwin hosts explicitly skip only that oracle; platform-independent retained-file, proxy, environment, and path-confinement tests remain mandatory in `test:security`. A Darwin host missing `sandbox-exec` still fails.
- The historical one engineering skill and v0.4.0 hook mesh were manifest-declared and statically checked. Fixture validation covered the documented lite/full change-contract projection, hook dispatcher matrix, and negative invariants, but it was test-only and proved neither prompt compliance nor runtime authority.
- Version 0.3.2 fixtures separately project native Todo state and the Verification Gate: all-completed Todos plus exit 1 or missing evidence yields BLOCKED and no finish confirmation, while all mandatory raw evidence passing may yield PASS. A status fixture exposes the `All done`/failed-evidence contradiction.

## Schema and validator provenance

The exact schema is checked in at `provenance/cursor/plugin.schema.2a804442.json`, from `cursor/plugins` commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`, SHA-256 `a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed`. Retrieval and the upstream MIT statement are recorded beside it.

Cursor's pinned `scripts/validate-plugins.mjs` first requires a marketplace manifest and iterates marketplace entries. That official repository workflow is therefore not a usable single-plugin validator for this private standalone layout. Tests apply its official plugin schema directly and separately enforce documented path and local policy checks. No claim is made that this reproduces an unpublished Cursor runtime parser or marketplace review.

## Evidence and no-model result

Run `31896492421` failed on Ubuntu at `tools/real-host-suite.mjs` with `REAL_HOST_DARWIN_SANDBOX_REQUIRED` after unit, characterization, and security tests passed (security: 11 pass, one expected Darwin identity skip). The failure was platform selection, not a failed confinement assertion.

Historical 0.2.0 local evidence was: focused 9/9 Cursor schema/frontmatter/docs checks, 13/13 portability/security checks, and `bun run verify` on Darwin with unit 76/76, integration 12/12, characterization 10/10 plus installer, security 12/12, the full Darwin real-host oracle, staged release 9/9, resource-size, artifact, provenance/relocation, and secret checks. Those counts are retained only as superseded evidence, not a description of the expanded 0.3.0 suite.

For the historical 0.3.0 inert-hook surface, Private CI run `31901827610` completed successfully at `c8130e131b138f5b34b92708347c4329fa7ee26d`. Its independent-review follow-up also passed the then-current local `bun run verify` on Darwin with the recorded counts. These are historical repository-verification facts only. They established neither then-current v0.4.0 hook-mesh verification nor Cursor runtime behavior; v0.4.0 local verification and CI had to be reported against their actual commit and could not be inferred from the baseline run.

The retained real-host suite is for the inherited OpenCode plugin boundary, not Cursor. Its isolated negative result reports zero provider/inference attempts and no successful external egress under its stated oracle. This audit itself invoked no model. Neither fact proves that a future authenticated Cursor session is local-only, confidential, network-free, MCP-free, or incapable of inference.

## Remaining unknowns after CLI smoke

The authorized CLI smoke resolved some discovery and workflow questions but cannot prove:

1. editor loading, editor `AskQuestion` UX, or editor/CLI parity;
2. behavior on other Cursor versions, accounts, policies, or installation modes;
3. deterministic automatic selection, complete Task/backend telemetry, model routing/fallback, or prompt compliance;
4. effective read/write, shell, network, MCP, data-processing, retention, privacy, plan, or admin-policy behavior;
5. uninstall/marketplace behavior, because this surface is invocation-scoped and not installed; or
6. parity with Cursor's unpublished runtime parser or review process.

Reassess these statements against dated CLI/docs and separately approved editor or additional credentialed smoke before any installation, publication, or stronger claim.

## Citation ledger

| ID | Primary source (accessed 2026-08-15) | Supports | Limitation |
| --- | --- | --- | --- |
| C1 | Cursor plugin schema at pinned commit: https://raw.githubusercontent.com/cursor/plugins/2a8044425c7bddf429c3bdedf3ab61e791d34d65/schemas/plugin.schema.json | Manifest fields, types, author shape, name pattern, `additionalProperties: false` | Does not validate path safety/existence or runtime loading |
| C2 | Cursor plugin reference: https://cursor.com/docs/reference/plugins | Components, discovery, path checklist | Current web documentation can change |
| C3 | Cursor subagents: https://cursor.com/docs/subagents | Frontmatter types, built-ins, explicit invocation, automatic delegation, readonly wording and fallback caveats | Does not prove runtime enforcement or prompt compliance |
| C4 | Cursor CLI parameters: https://cursor.com/docs/cli/reference/parameters | `--workspace`, `--plugin-dir`, authentication commands, trust option | Help/version behavior can drift |
| C5 | Cursor CLI usage: https://cursor.com/docs/cli/using | CWD default, `AGENTS.md`, persistent/resumable sessions | Does not fully specify storage lifecycle |
| C6 | Cursor CLI authentication: https://cursor.com/docs/cli/reference/authentication | Login/API-key requirement and locally stored login credentials | No credentials were used in this audit |
| C7 | Cursor CLI changelog: https://cursor.com/docs/cli/changelog | Accepted trust can record a saved decision | Changelog evidence is version-sensitive |
| C8 | Pinned official validator: https://raw.githubusercontent.com/cursor/plugins/2a8044425c7bddf429c3bdedf3ab61e791d34d65/scripts/validate-plugins.mjs | Marketplace-coupled validation behavior | Not a standalone-plugin validator |
| C9 | GitHub Actions run [`31901827610`](https://github.com/iamsterling/curiosity-cursor-plugin/actions/runs/31901827610), commit `c8130e131b138f5b34b92708347c4329fa7ee26d` | Historical successful repository CI for the 0.3.0 six-agent + skill + inert-hook surface | Predates and does not verify the v0.4.0 mesh; no Cursor/model session occurred |
| C10 | GitHub Actions run `31896492421` | Historical Ubuntu root-cause evidence | Superseded by C9; predates the 0.3.0 surface |

## Contradictions, curiosity log, and stop decision

The key contradictions were invocation-scoped plugin loading versus persistent ordinary Cursor state, “read-only” language versus the narrower documented tool restriction, and native `All done` versus failed mandatory evidence. All are now explicit rather than resolved by assumption; the last is represented by separate Todo and Verification Gate projections.

`CURIOSITY_NO_GO`: do not run a credentialed Cursor/model experiment, infer privacy from `readonly`, or broaden platform support with a weaker confinement fallback in this scope.

Bounded-curiosity stop: primary docs, the pinned schema/validator, the failed CI log, and local tests answer the static and portability questions. Further searching has low expected value without crossing the prohibited live-session boundary, so research stops here.
