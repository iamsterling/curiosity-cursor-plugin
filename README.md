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

From this repository root, opt in for one Cursor CLI invocation:

```sh
agent --plugin-dir "$PWD"
```

Cursor documents local plugin loading in its [CLI parameter reference](https://cursor.com/docs/cli/reference/parameters), the manifest and agent layout in the [plugin reference](https://cursor.com/docs/reference/plugins), and agent behavior/frontmatter in the [subagents reference](https://cursor.com/docs/subagents). Stopping use of the `--plugin-dir` argument is the operational rollback; this repository does not install or copy anything into Cursor configuration.

The coordinator is advisory, is not Cursor's default or primary agent, and cannot guarantee Task access, delegation, or routing. No live Cursor/model smoke test is claimed. The existing OpenCode research surface coexists with this native surface and is not cut over.

## Development

```sh
bun install --frozen-lockfile
bun run verify
```

The package and repository are private. Do not publish to npm or install globally from this research tree. Native Phase 0 and Phase 1 cover only the local manifest and read-only agents; broader conversion remains pending.

## Provenance

This tree preserves MIT-licensed OpenCode Loop attribution and clean-room research provenance. See [`docs/provenance.md`](docs/provenance.md) and [`provenance/`](provenance/).
