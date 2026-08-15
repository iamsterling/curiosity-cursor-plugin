# Curiosity Cursor Plugin

Private, research-phase plugin foundation for evaluating a future Cursor-focused conversion of selected OpenCode agent, research, handoff, and engineering-guidance assets.

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

Not shipped:

- native loop execution, continuation, lifecycle, or tools;
- Ledger lifecycle authority, runtime hooks, or tools;
- graph, Beads, or OpenSpec engines;
- experimental typed engineering admission/controllers, external records, or local effects;
- native Cursor integration.

Every `/loop-*` alias is markdown-only. Runtime operations return `CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED`; compaction remains manual host guidance. The aliases are retained temporarily pending an explicit Cursor command mapping and may then be retired.

## Development

```sh
bun install --frozen-lockfile
bun run verify
```

The package and repository are private. Do not publish to npm or install globally from this research tree. Native Cursor conversion research remains pending; this repository does not claim that conversion is complete.

## Provenance

This tree preserves MIT-licensed OpenCode Loop attribution and clean-room research provenance. See [`docs/provenance.md`](docs/provenance.md) and [`provenance/`](provenance/).
