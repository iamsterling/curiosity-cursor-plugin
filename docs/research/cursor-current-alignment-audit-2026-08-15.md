# Cursor current-alignment audit — 2026-08-15

## Question, scope, and verdict

Question: does the repository's additive Cursor Phase 0/1 surface match the currently documented Cursor plugin and subagent contracts, and are its operational and CI claims bounded by evidence?

Scope was static manifest/frontmatter validation, accidental component discovery, operator documentation, and the existing credential-free OpenCode real-host CI probe. No Cursor CLI login, model session, plugin load, installation, global configuration, cloud agent, MCP execution, or inference was performed.

The incoming verdict was **NOT ALIGNED** because documentation and tests overstated or omitted important boundaries, although no manifest or frontmatter defect was proven. The fixes recorded here passed local static and full verification, but the fresh Ubuntu CI result was not yet available when this note was authored. The durable verdict therefore remains **NOT ALIGNED pending fresh CI**. If that required check passes, the maximum justified label is **aligned with documented uncertainty**, never complete Cursor alignment.

## Fixed gaps

- Operator docs now separate plugin root from target workspace, record CWD as the default workspace, and warn that root `AGENTS.md` can become a workspace instruction.
- Authentication, trust prompts/saved trust, persistent ordinary account/session state, and plugin-only rollback are explicit.
- The four deterministic explicit invocations are `/curiosity-coordinator`, `/curiosity-researcher`, `/curiosity-reviewer`, and `/curiosity-strategist`; automatic selection is nondeterministic.
- `readonly: true` is bounded to the documented restriction against file edits and state-changing shell commands. It is not confidentiality, no-read, local-only processing, no-network/no-MCP, or proof of prompt compliance; version, mode, tool policy, plan, and admin controls matter.
- Manifest checks use an exact pinned official schema. YAML frontmatter uses the pinned `yaml` parser with duplicate-key diagnostics and scalar-type checks.
- Official Cursor format assertions are named separately from local product policy. Local checks cover path safety/existence, the `curiosity-` naming policy, built-in collisions (`explore`, `bash`, `browser`), and automatic-discovery exclusions (`SKILL.md`, `skills/`, `rules/`, `commands/`, `hooks/`, `hooks/hooks.json`, and `mcp.json`). Root `AGENTS.md` is explicitly a workspace instruction rather than a plugin component.
- Ubuntu CI no longer fails merely because the full real-host oracle uses Darwin `sandbox-exec`. Non-Darwin hosts explicitly skip only that oracle; platform-independent retained-file, proxy, environment, and path-confinement tests remain mandatory in `test:security`. A Darwin host missing `sandbox-exec` still fails.

## Schema and validator provenance

The exact schema is checked in at `provenance/cursor/plugin.schema.2a804442.json`, from `cursor/plugins` commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`, SHA-256 `a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed`. Retrieval and the upstream MIT statement are recorded beside it.

Cursor's pinned `scripts/validate-plugins.mjs` first requires a marketplace manifest and iterates marketplace entries. That official repository workflow is therefore not a usable single-plugin validator for this private standalone layout. Tests apply its official plugin schema directly and separately enforce documented path and local policy checks. No claim is made that this reproduces an unpublished Cursor runtime parser or marketplace review.

## Evidence and no-model result

Run `31896492421` failed on Ubuntu at `tools/real-host-suite.mjs` with `REAL_HOST_DARWIN_SANDBOX_REQUIRED` after unit, characterization, and security tests passed (security: 11 pass, one expected Darwin identity skip). The failure was platform selection, not a failed confinement assertion.

After the fix, focused local tests passed 9/9 Cursor schema/frontmatter/docs checks and 13/13 portability/security checks. `bun run verify` exited 0 on Darwin: unit 76/76, integration 12/12, characterization 10/10 plus installer, security 12/12, the full Darwin real-host oracle, staged release 9/9, resource-size, artifact, provenance/relocation, and secret checks. This is local evidence, not a substitute for the fresh Ubuntu run.

The retained real-host suite is for the inherited OpenCode plugin boundary, not Cursor. Its isolated negative result reports zero provider/inference attempts and no successful external egress under its stated oracle. This audit itself invoked no model. Neither fact proves that a future authenticated Cursor session is local-only, confidential, network-free, MCP-free, or incapable of inference.

## Remaining unknowns: cannot prove without a live smoke

No live Cursor/model smoke test was run. Static checks cannot prove:

1. that the installed Cursor CLI version loads this local manifest and exactly these four agents;
2. the actual trust prompt and persisted-state behavior on the operator's version and policy;
3. explicit invocation, automatic selection, Task availability, delegation, routing, model fallback, or prompt compliance;
4. effective read/write, shell, network, MCP, data-processing, retention, privacy, plan, or admin-policy behavior;
5. uninstall/marketplace behavior, because this surface is invocation-scoped and not installed; or
6. parity with Cursor's unpublished runtime parser or review process.

Reassess these statements against dated CLI/docs and a separately approved credentialed smoke before any installation, publication, or stronger claim.

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
| C9 | GitHub Actions run `31896492421` | Ubuntu root-cause evidence | Predates this fix |

## Contradictions, curiosity log, and stop decision

The key contradiction was invocation-scoped plugin loading versus persistent ordinary Cursor state; the old docs treated removal of one flag too broadly. Another was “read-only” language versus the narrower documented tool restriction. Both are now explicit rather than resolved by assumption.

`CURIOSITY_NO_GO`: do not run a credentialed Cursor/model experiment, infer privacy from `readonly`, or broaden platform support with a weaker confinement fallback in this scope.

Bounded-curiosity stop: primary docs, the pinned schema/validator, the failed CI log, and local tests answer the static and portability questions. Further searching has low expected value without crossing the prohibited live-session boundary, so research stops here.
