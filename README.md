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
- a native Cursor Plugin manifest exposing four read-only `curiosity-*` advisory agents for coordination, research, review, and strategy.

Not shipped:

- native loop execution, continuation, lifecycle, or tools;
- Ledger lifecycle authority, runtime hooks, or tools;
- graph, Beads, or OpenSpec engines;
- experimental typed engineering admission/controllers, external records, or local effects;
- native Cursor hooks, MCP servers, rules, commands, skills, variables, installation, or marketplace distribution.

Every `/loop-*` alias is markdown-only. Runtime operations return `CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED`; compaction remains manual host guidance. The aliases are retained temporarily pending an explicit Cursor command mapping and may then be retired.

## Native Cursor local use

Actual Cursor sessions require CLI authentication (`agent login` or an API key); `agent status` reports the current account state. The CLI uses the current working directory (CWD) as its default workspace. Using this repository as that workspace can therefore load root `AGENTS.md` as a project instruction, not as a plugin component.

Keep plugin root and target workspace distinct when evaluating against another project. Cursor's current global-option help documents this option-before-prompt shape:

```sh
agent --workspace <target> --plugin-dir <plugin-root>
```

Cursor documents both global options in its [CLI parameter reference](https://cursor.com/docs/cli/reference/parameters), CWD and `AGENTS.md` behavior in [Using Agent](https://cursor.com/docs/cli/using), the manifest layout in the [plugin reference](https://cursor.com/docs/reference/plugins), and agent behavior in the [subagents reference](https://cursor.com/docs/subagents). Workspace trust may prompt; an accepted trust decision can persist. Normal Cursor account and session state can also persist. Omitting `--plugin-dir` on later invocations rolls back only invocation-scoped plugin loading; it does not clear ordinary Cursor trust, account, or session state.

Invoke an agent explicitly as `/curiosity-coordinator`, `/curiosity-researcher`, `/curiosity-reviewer`, or `/curiosity-strategist`. Automatic selection is nondeterministic. `readonly: true` is Cursor's documented restriction of no file edits and no state-changing shell commands; it is not confidentiality, a no-read boundary, local-only processing, a no-network/no-MCP guarantee, or proof of prompt compliance. Enforcement depends on Cursor version, mode, tool policy, and team/admin policy. The coordinator remains advisory and cannot guarantee Task access, delegation, or routing. No live Cursor/model smoke test is claimed. The existing OpenCode research surface coexists with this native surface and is not cut over.

## Development

```sh
bun install --frozen-lockfile
bun run verify
```

The package and repository are private. Do not publish to npm or install globally from this research tree. Native Phase 0 and Phase 1 cover only the local manifest and read-only agents; broader conversion remains pending.

## Provenance

This tree preserves MIT-licensed OpenCode Loop attribution and clean-room research provenance. See [`docs/provenance.md`](docs/provenance.md) and [`provenance/`](provenance/).
