# Tasks: add-curiosity-spec-command

## Reconciled implementation status (2026-08-17)

- [x] Command/package surface exists. Evidence: `.cursor-plugin/plugin.json`, `commands/`, and `tests/unit/command-routing.test.mjs`.
- [x] Integrated immutable spec-before-write authority is represented in active command contracts and the canonical rule. Evidence: `tests/unit/integrated-spec-first.test.mjs` and `rules/curiosity-delivery.mdc`.
- [x] Package text directly states integrated writable-route persistence and same-Task mutation; obsolete optional-persistence normative text was removed. Evidence: proposal, design, delta spec, and `tests/unit/final-commit-blockers.test.mjs`.
- [ ] BLOCKED: live Cursor semantic evidence is unavailable by owner instruction; the recorded single smoke remains 10/11 FAIL and was not rerun.
- [x] Full local verification and strict package validation passed. Evidence: focused blocker suites, `bun run verify`, and `openspec validate <change-id> --strict` for all ten packages on 2026-08-17.

Unchecked items are explicit evidence gaps, not claims that the installed command is absent. Plan/Todo/tasks are non-authoritative projections.
