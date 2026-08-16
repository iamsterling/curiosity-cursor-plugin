# Pinned Cursor sources

`plugin.schema.2a804442.json` is an exact copy of Cursor's `schemas/plugin.schema.json` at commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`:

https://raw.githubusercontent.com/cursor/plugins/2a8044425c7bddf429c3bdedf3ab61e791d34d65/schemas/plugin.schema.json

- Retrieved: 2026-08-15
- SHA-256: `a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed`
- Upstream repository: https://github.com/cursor/plugins
- Upstream license statement at the pinned commit: `README.md` says MIT.

The exact checked-in bytes make schema validation reproducible. Local path existence/safety, discovery exclusions, naming, and advisory-prompt policy are deliberately tested separately because they are not all represented by this schema.

The current source manifest declares three read-only agents, one file-only skill, one command, and one always-applied rule, with no hook, MCP, variable, or executable component. The main Agent is sole editor and raw evidence outranks Todo state. The schema validates manifest fields only; prompt/file checks cannot prove Cursor discovery, rule application, Plan behavior, reviewer resumption, model availability/fallback, compliance, or runtime alignment.

The sanitized live CLI evidence ledger, including report and external manifest hashes, is recorded in `docs/research/cursor-live-smoke-2026-08-15.md`. It mostly exercises the CLI surface with explicit partial results; raw temporary evidence is not checked in and is subject to cleanup. Editor behavior remains unverified.

The sanitized aggregate evidence, public primary-source guidance, inference, and limitations behind the smaller bundle are recorded in `docs/provenance/cursor-usage-analysis-2026-08-16.md`.

Historical hook and parity-workflow records do not define the installed surface. See ADR 0026 and the authoritative usage-driven specification for current behavior.
