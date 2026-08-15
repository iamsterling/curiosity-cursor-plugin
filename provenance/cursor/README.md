# Pinned Cursor schema

`plugin.schema.2a804442.json` is an exact copy of Cursor's `schemas/plugin.schema.json` at commit `2a8044425c7bddf429c3bdedf3ab61e791d34d65`:

https://raw.githubusercontent.com/cursor/plugins/2a8044425c7bddf429c3bdedf3ab61e791d34d65/schemas/plugin.schema.json

- Retrieved: 2026-08-15
- SHA-256: `a393b758901803fcf5cfe0d77bda8a83e987d32c3377dfce2d9edf445af884ed`
- Upstream repository: https://github.com/cursor/plugins
- Upstream license statement at the pinned commit: `README.md` says MIT.

The exact checked-in bytes make schema validation reproducible. Local path existence/safety, discovery exclusions, naming, and advisory-prompt policy are deliberately tested separately because they are not all represented by this schema.

Version 0.2.0 uses the schema's documented `skills` and `hooks` manifest fields. Skill metadata and hook configuration/runtime behavior are validated separately because this plugin schema does not define their internal file formats. See `docs/provenance/cursor-native-engineering-workflow.md` for official source links and remaining runtime unknowns.
