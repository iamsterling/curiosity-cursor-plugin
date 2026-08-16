# Curiosity Cursor Plugin

Private plugin foundation with an additive, locally loaded native Cursor advisory surface and the existing OpenCode research assets.

## Current boundary

Retained and verified:

- bundled agent definitions and default orchestrator routing;
- prompt/resource skills for bounded curiosity, deep research, competitive analysis, reverse engineering, review, verification, and handoff compilation;
- `/bug`, `/feature`, `/secure`, and `/research` engineering guidance;
- the handoff compiler and its fixtures/tests;
- generic redacted event/tool capture under `.opencode/curiosity-cursor-plugin/capture/v1/`;
- pure Ledger domain/archive primitives and focused tests;
- provenance, attribution, and reproducible asset manifests;
- temporary `/loop-*` command-name compatibility aliases.
- a Cursor-native manifest exposing three read-only specialists, one implementation-discipline skill, one deliver-change command, and one always-applied rule;
- `/curiosity-deliver-change`, an explicit discovery → implementation → project checks → independent review workflow in which the main Agent is sole editor and synthesizer;
- static model preferences with compatible host fallback; backend identity and dynamic per-Task selection are not guaranteed.

Not shipped:

- native loop execution, continuation, lifecycle, or tools;
- Ledger lifecycle authority, runtime hooks, or tools;
- graph, Beads, or OpenSpec engines;
- experimental typed engineering admission/controllers, external records, or local effects;
- hooks, MCP servers, variables, executable assets, external runtimes/processes/stores, installation, or marketplace distribution;
- automatic workflow continuation, plugin-owned lifecycle state, OpenSpec or Beads implementation, or completion authority.

Every `/loop-*` alias is markdown-only. Runtime operations return `CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED`; compaction remains manual host guidance. The aliases are retained temporarily pending an explicit Cursor command mapping and may then be retired.

## Native Cursor local use

Actual Cursor sessions require CLI authentication (`agent login` or an API key); `agent status` reports the current account state. The CLI uses the current working directory (CWD) as its default workspace. Using this repository as that workspace can therefore load root `AGENTS.md` as a project instruction, not as a plugin component.

Keep plugin root and target workspace distinct when evaluating against another project. Cursor's current global-option help documents this option-before-prompt shape:

```sh
agent --workspace <target> --plugin-dir <plugin-root>
```

Cursor documents both global options in its [CLI parameter reference](https://cursor.com/docs/cli/reference/parameters), CWD and `AGENTS.md` behavior in [Using Agent](https://cursor.com/docs/cli/using), the manifest layout in the [plugin reference](https://cursor.com/docs/reference/plugins), and agent behavior in the [subagents reference](https://cursor.com/docs/subagents). Workspace trust may prompt; an accepted trust decision can persist. Normal Cursor account and session state can also persist. Omitting `--plugin-dir` on later invocations rolls back only invocation-scoped plugin loading; it does not clear ordinary Cursor trust, account, or session state.

Invoke `/curiosity-deliver-change` for explicit delivery, or `/curiosity-researcher`, `/curiosity-reviewer`, and `/curiosity-strategist` selectively. The main Agent inherits the user's model selection, built-in Explore is Cursor-managed, and custom specialists remain read-only. `readonly: true` means no file edits and no state-changing shell commands; it is not confidentiality, a no-read boundary, local-only processing, a no-network/no-MCP guarantee, or proof of prompt compliance. Behavior depends on Cursor version, mode, plan, tool/admin policy, and model availability. Model pins are preferences subject to compatible fallback; actual backend identity is not guaranteed. The existing OpenCode research surface coexists and is not cut over.

The command converts intent to binary criteria, uses native Explore and consequential Plan Mode, applies a behavior-test RED and minimal patch through the main Agent, runs only project-supported checks, and requests independent review. A repair resumes the same reviewer, with at most two review cycles. Native Todo state remains a progress aid: raw evidence controls reporting. The plugin never installs tools and contains no external runtime.

## Development

```sh
bun install --frozen-lockfile
bun run verify
```

The package and repository are private. Do not publish to npm or install globally from this research tree. Historical sanitized evidence does not establish current editor behavior, model availability, complete runtime parity, or host enforcement.

## Provenance

This tree preserves MIT-licensed OpenCode Loop attribution and clean-room research provenance. See [`docs/provenance.md`](docs/provenance.md) and [`provenance/`](provenance/).
