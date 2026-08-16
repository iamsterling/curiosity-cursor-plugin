# Usage-driven Cursor-native delivery boundary

**Status:** Normative, accepted 2026-08-16.

## Installed Cursor surface

The manifest installs exactly three read-only Markdown agents, one file-only Markdown skill, one Markdown command, and one always-applied Markdown rule. The main Cursor Agent is the sole editor and synthesizer. Built-in Explore owns broad codebase discovery; native Plan Mode owns consequential planning.

| Component | Purpose | Model preference |
| --- | --- | --- |
| `curiosity-strategist` | Selective consequential architecture and strategy | `grok-4.6` |
| `curiosity-reviewer` | Independent correctness, maintainability, test, and risk-triggered security review | `claude-sonnet-5` |
| `curiosity-researcher` | Bounded primary-source research and claim ledger | `grok-4.6` |
| `curiosity-implementation-discipline` | Main-Agent test-first minimal-patch and evidence discipline | main Agent selection |
| `curiosity-deliver-change` | Explicit end-to-end delivery entrypoint | main Agent selection |
| `curiosity-delivery` rule | Always-applied authority and evidence invariants | n/a |

All specialists are read-only and non-delegating. They advise the main Agent; none coordinates, edits, repairs, or synthesizes the final result. There is no custom coordinator, explorer, planner, analyst, worker, generalist, or implementer.

## Delivery flow

`/curiosity-deliver-change` translates outcome and constraints into binary criteria; uses native Todos only as progress aids and native Explore for discovery; uses native Plan Mode and optionally the strategist when consequential; has the main Agent implement test-first; runs project-supported checks; obtains independent reviewer judgment; and reports criterion-to-evidence results. A blocked review may be repaired by the main Agent and resumed with the same reviewer, with a maximum of two review cycles.

Raw command output, exit status, diff inspection, and review findings control reporting. Todo status does not. A FAIL or MISSING mandatory check remains disclosed and cannot be converted to success by completion prose.

## Runtime and project boundary

The installed surface contains no scripts, executable hooks, SDK, MCP, CLI wrapper, service, daemon, custom store, transcript parser, external runtime, installer, or executable asset. Cursor may conditionally run commands already supplied or documented by the edited project through its native terminal. It never installs tools, guesses a command, or substitutes an unapproved global dependency.

The repository's TypeScript/OpenCode source, development dependencies, packaging utilities, and `/loop-*` compatibility are a separate retained foundation. They are not installed Cursor components. No npm publication, installation, marketplace cutover, or OpenCode cutover is authorized.

## Models, plans, and host uncertainty

The baseline is Cursor Pro and the static file-only bundle is intended to be portable to Pro Plus, Ultra, Teams, and Enterprise. Named model pins are preferences subject to plan/team availability and compatible host fallback; actual backend identity is not guaranteed. Main Agent selection is user-owned and built-in Explore is Cursor-managed. Plan UX, agent discovery, rule application, review resumption, tool permissions, and prompt compliance remain host/version/policy dependent.

`readonly: true` means the declared agent should not edit files or run state-changing shell commands. It is not confidentiality, no-read, local-only processing, no-network assurance, or proof of enforcement. Stop and ask on blocking ambiguity or unavailable required evidence.

## Acceptance checks

1. The official pinned schema accepts exactly three agents, one skill, one command, and one rule; no hook, MCP, variable, or executable component is registered.
2. Every installed asset is a regular, non-symlink, non-executable Markdown file; recursive scans find no runtime or install dependency.
3. Specialist readonly/model/output contracts and non-delegation are explicit.
4. The rule establishes main-Agent sole edit authority, native Explore/Plan use, raw-evidence authority, no external runtime/install, and stop/ask behavior.
5. The command encodes the observed discovery → edit → checks → independent review motif and no undocumented Task/Todo schema.
6. OpenCode separation and `/loop-*` compatibility characterization remain passing.
