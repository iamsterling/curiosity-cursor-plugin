# Pinned Cursor sources

`plugin.schema.2a804442.json` is an exact copy of Cursor's `schemas/plugin.schema.json` at commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`:

https://raw.githubusercontent.com/cursor/plugins/2a8044425c7bddf429c3bdedf3ab61e791d34d65/schemas/plugin.schema.json

- Retrieved: 2026-08-15
- SHA-256: `a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed`
- Upstream repository: https://github.com/cursor/plugins
- Upstream license statement at the pinned commit: `README.md` says MIT.

The exact checked-in bytes make schema validation reproducible. Local path existence/safety, discovery exclusions, naming, and advisory-prompt policy are deliberately tested separately because they are not all represented by this schema.

Version 0.4.0 declares six agents, one skill, and one stateless six-event command-hook mesh. Native Todos are attempted-work/progress projections; a separate prompt-level Verification Gate evaluates raw mandatory evidence after observed historical `All done` plus exit-1 behavior. Native-Plan reacceptance and bounded reviewer handoffs remain. The schema validates manifest fields only; prompt/fixture checks cannot prevent host rendering or prove Cursor discovery, compliance, or runtime alignment.

The sanitized live CLI evidence ledger, including report and external manifest hashes, is recorded in `docs/research/cursor-live-smoke-2026-08-15.md`. It mostly exercises the CLI surface with explicit partial results; raw temporary evidence is not checked in and is subject to cleanup. Editor behavior remains unverified.

`native-change-contract-sources.json` separately pins the exact Beads v1.1.0 and OpenSpec v1.8.0 files reviewed for the custom workflow's conceptual disposition. It records immutable commits/URLs, retrieval date, and SHA-256 digests. No source text, runtime, dependency, or asset from either project ships.

`hook-mesh-official-docs.json` records independently refetched official Cursor Hooks and Plugins documentation URLs, retrieval date, and response-byte SHA-256 digests. Those URLs are mutable; the ledger does not pretend the digest is an immutable upstream revision. The docs support the configured fields and event I/O only, not this plugin's policy correctness or live behavior.

The superseded 0.2.0 surface had four read-only agents plus the skill/hook fields. See `docs/provenance/cursor-native-engineering-workflow.md` for the native surface and remaining runtime unknowns.
