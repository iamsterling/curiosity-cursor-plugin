# Pinned Cursor sources

`plugin.schema.2a804442.json` is an exact copy of Cursor's `schemas/plugin.schema.json` at commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`:

https://raw.githubusercontent.com/cursor/plugins/2a8044425c7bddf429c3bdedf3ab61e791d34d65/schemas/plugin.schema.json

- Retrieved: 2026-08-15
- SHA-256: `a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed`
- Upstream repository: https://github.com/cursor/plugins
- Upstream license statement at the pinned commit: `README.md` says MIT.

The exact checked-in bytes make schema validation reproducible. Local path existence/safety, discovery exclusions, naming, and advisory-prompt policy are deliberately tested separately because they are not all represented by this schema.

The current source manifest declares four agents (three read-only and one writable implementer), five file-only skills, twelve commands, and one always-applied rule, with no hook, MCP, variable, or executable component. Main's no-edit boundary and the bounded-curiosity receipt gate are required semantic invariants, not host enforcement; raw evidence outranks Todo state. The schema validates manifest fields only and cannot prove Cursor discovery, routing compliance, skill availability, rule application, Agent/Plan behavior, receipt compliance, reviewer resumption, model availability/fallback, or runtime alignment.

`role-skill-architecture-sources.json` is the sanitized, machine-readable source and license ledger for the independently authored 0.6 architecture. It contains references and dispositions only, not third-party or local source bytes.

The historical sanitized live CLI evidence ledger, including report and external manifest hashes, is retained at `provenance/history/docs/research/cursor-live-smoke-2026-08-15.md`. It mostly exercised the CLI surface with explicit partial results; raw temporary evidence is not checked in. Editor behavior remains unverified.

The sanitized aggregate evidence, public primary-source guidance, inference, and limitations behind the smaller bundle are recorded in `docs/provenance/cursor-usage-analysis-2026-08-16.md`.

Historical hook and parity-workflow records do not define the installed surface. See ADR 0027, ADR 0028, ADR 0029, and the authoritative usage-driven specification for current behavior.
