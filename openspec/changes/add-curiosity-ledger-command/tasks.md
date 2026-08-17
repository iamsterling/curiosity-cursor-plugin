# Tasks: add-curiosity-ledger-command

## Reconciled implementation status (2026-08-17)

- [x] Command/package surface exists. Evidence: `.cursor-plugin/plugin.json`, `commands/`, and `tests/unit/command-routing.test.mjs`.
- [x] Integrated immutable spec-before-write authority is represented in active command contracts and the canonical rule. Evidence: `tests/unit/integrated-spec-first.test.mjs` and `rules/curiosity-delivery.mdc`.
- [x] Package text is reconciled as a compatibility input under ADR 0033; superseded manual/optional-write assumptions are not current authority. Evidence: integrated authority notes in proposal, design, and delta spec.
- [ ] BLOCKED: live Cursor semantic evidence is unavailable by owner instruction; the recorded single smoke remains 10/11 FAIL and was not rerun.
- [x] Full local verification and strict package validation passed. Evidence: `bun run verify` and `openspec validate <change-id> --strict` on 2026-08-17.

Unchecked items are explicit evidence gaps, not claims that the installed command is absent. Plan/Todo/tasks are non-authoritative projections.
