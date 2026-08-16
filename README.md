# Curiosity Cursor Plugin

A public MIT-licensed, Cursor-only, file-only plugin for evidence-based software delivery.

## Installed surface

The Cursor manifest exposes exactly four agents, five composable file-only skills, one command, and one always-applied rule. Separate agents provide independent context and authority; skills provide expertise within the correct role. The main Agent orchestrates and synthesizes while one bounded implementer edits. The plugin has no hooks, MCP server, SDK, executable assets, external runtime, state store, or installer; installed use requires only Cursor.

Curiosity is foundational policy, not an optional research mode or added specialist. Delivery combines AUTHORITY, CURIOSITY, and EVIDENCE: bounded children challenge consequential assumptions, every substantive result (including Explore) supplies the shared compact receipt, and main applies the Curiosity Gate before progress. The canonical protocol lives only in [`rules/curiosity-delivery.mdc`](rules/curiosity-delivery.mdc); it is semantic guidance, not runtime validation.

- `curiosity-strategist`: consequential architecture and trade-off advice.
- `curiosity-reviewer`: independent correctness, maintainability, test, and risk-triggered security review.
- `curiosity-researcher`: bounded primary-source research and claim ledgers.
- `curiosity-implementer`: sole writable source editor for one bounded task.
- `curiosity-implementation-discipline`: test-first minimal-change discipline for the implementer.
- `curiosity-architecture-awareness`: pre-edit boundary detection for the implementer.
- `curiosity-decision-design`: consequential decision method for the strategist.
- `curiosity-research-evidence`: external evidence method for the researcher.
- `curiosity-independent-review`: dual-pass evidence-aware method for the reviewer.
- `/curiosity-deliver-change`: delegated discovery → bounded implementation → checks → independent review.

**Required semantic invariant:** main never edits project source or runs project-mutating shell commands. It keeps intent, decisions, native Plan/Todo state, concise findings, acceptance criteria, evidence, agent IDs, and reviewer verdicts. **Desired host enforcement:** Cursor cannot currently enforce this exact main/child split because children inherit the parent mode and tool envelope. The no-edit boundary is prompt-governed, not a capability guarantee. Stay in Agent mode for writable hierarchy; Ask/Plan cannot be expected to elevate a child.

See [`docs/architecture/current-state.md`](docs/architecture/current-state.md), [ADR 0030](docs/decisions/0030-role-authority-and-composable-expertise.md), and the normative [delivery specification](docs/specs/vanilla-cursor-native-orchestration.md).

## Target-project dependency policy

The plugin never installs or downloads its own runtime, tooling, SDK, package manager, or dependencies. The assigned implementer may add a dependency to the target project only after explicit user approval of the exact package, its purpose, prod/dev scope, the project-owned package-manager command, and expected manifest and lockfile changes. Use only the project's existing or documented manager and manifests. Never install globally, guess a manager, substitute `npx`, or use a curl-pipe bootstrap. Stop on ambiguity. Record command output and status, resulting diff, and verification.

## Local Cursor loading

Keep this plugin root separate from the target workspace. Cursor documents local loading in its plugin and CLI references; one supported CLI shape is:

```sh
agent --workspace <target> --plugin-dir <plugin-root>
```

Authentication, workspace trust, model availability, tool permissions, and prompt enforcement remain Cursor host concerns. `readonly: true` declares the researcher, strategist, and reviewer read-only; the implementer declares `readonly: false`. Neither declaration proves runtime enforcement, confidentiality, or network isolation.

## Repository development

```sh
bun install --frozen-lockfile
bun run verify
```

`package.json` retains `"private": true` solely as an npm publication interlock. It does not describe the visibility of this public Git repository. Do not publish, release, globally install, or cut over from this checkout without a separately reviewed change.

## Provenance

Historical imported material remains attributed under [`provenance/`](provenance/). It is provenance, not a current product or compatibility promise. See [`docs/provenance.md`](docs/provenance.md).
