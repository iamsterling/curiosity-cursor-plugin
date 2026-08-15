# Repository Constitution

This private repository contains `@iamsterling/curiosity-cursor-plugin`, a research-phase plugin split derived from the MIT-licensed OpenCode Loop import.

- Preserve source attribution and reproducible manifests in `provenance/`.
- Runtime identity is `iamsterling.curiosity-cursor-plugin`; plugin capture state belongs under `.opencode/curiosity-cursor-plugin/`.
- Native Cursor conversion is pending; never claim it is complete.
- Keep the completed `/loop-*` markdown aliases temporarily while explicit Cursor command mapping is undecided; they must not claim a working native loop or Ledger runtime.
- Never commit credentials, runtime state, logs, generated caches, dependencies, or global user configuration.
- Do not publish to npm, install globally, or cut over an installation from this repository without a separately reviewed change.
- Use concise ADRs in `docs/decisions/` for consequential choices.
- Before behavior changes, add a failing focused test; run `bun run verify` before handoff.
