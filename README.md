# OpenCode2 Config plugin platform

A private, first-class OpenCode 2 plugin platform for peer features: orchestration, handoff contracts, evidence, future Ledger Authority, native loop execution, and managed assets/platform tooling.

## Foundation

- One `Plugin.define` composition root: `src/plugin/plugin.ts`.
- Strict TypeScript, unbundled compiled ESM in `dist/`, declarations and source maps.
- Exact host dependency: `@opencode-ai/plugin@0.0.0-next-17125`.
- Manifest-owned assets under `assets/`; runtime never imports executable asset logic.
- Imported loop behavior is visibly quarantined in `src/features/loop-compat/`.
- `loop-engine` is ports/types only pending mandatory real-host probes.

## Compatibility

`/loop-*`, `[opencode-loop:<command>]`, `opencode-loop-local`, and `opencode_loop_goal_*` remain compatibility/recovery surfaces. State v1, explicit legacy-v4 import, handoff digest behavior, semantic-completion rejection/manual override, and fixed retry rules remain characterized. The old daemon is deprecated compatibility tooling and is not installed or composed by default.

## Development

```sh
bun install --frozen-lockfile
bun run verify
```

`verify` runs asset generation, typecheck, ESLint/boundaries, format check, unit/integration/characterization suites, build/artifact import, full-history provenance, and secret scan. Provenance verification requires full Git history; shallow clones cannot reproduce historical blobs.

No global install, user configuration mutation, state cutover, provider default, Ledger semantics, or native loop semantic rewrite is performed by this foundation migration.
