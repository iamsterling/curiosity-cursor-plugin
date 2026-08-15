# Pinned Cursor sources

`plugin.schema.2a804442.json` is an exact copy of Cursor's `schemas/plugin.schema.json` at commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`:

https://raw.githubusercontent.com/cursor/plugins/2a8044425c7bddf429c3bdedf3ab61e791d34d65/schemas/plugin.schema.json

- Retrieved: 2026-08-15
- SHA-256: `a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed`
- Upstream repository: https://github.com/cursor/plugins
- Upstream license statement at the pinned commit: `README.md` says MIT.

The exact checked-in bytes make schema validation reproducible. Local path existence/safety, discovery exclusions, naming, and advisory-prompt policy are deliberately tested separately because they are not all represented by this schema.

Version 0.3.0 declares six agents, one skill, and one inert hook. The schema validates manifest fields only; agent frontmatter, skill metadata/contract projections, and hook configuration/behavior are checked separately. These are static claims and do not prove Cursor discovery, prompt compliance, or runtime alignment.

`native-change-contract-sources.json` separately pins the exact Beads v1.1.0 and OpenSpec v1.8.0 files reviewed for the custom workflow's conceptual disposition. It records immutable commits/URLs, retrieval date, and SHA-256 digests. No source text, runtime, dependency, or asset from either project ships.

The superseded 0.2.0 surface had four read-only agents plus the skill/hook fields. See `docs/provenance/cursor-native-engineering-workflow.md` for the current 0.3.0 surface and remaining runtime unknowns.
