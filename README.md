# opencode2-config

Private OpenCode 2 plugin package: `@iamsterling/opencode2-config`.

This is a brand-new plugin identity built from the MIT-licensed OpenCode Loop implementation. It preserves the imported loop behavior and all 30 `/loop-*` command templates while establishing a separate runtime and state boundary.

## Status

- Runtime plugin ID: `iamsterling.opencode2-config`
- Native project state: `.opencode/opencode2-config/`
- Native daemon task state: the `opencode2-config/tasks` platform data directory (override: `OPENCODE2_CONFIGD_TASK_DIR`)
- Daemon binary: `opencode2-configd`; installer binary: `opencode2-config`
- Command compatibility marker: `[opencode-loop:<command>]`
- OpenCode plugin dependency: exact pin `0.0.0-next-17125`
- Distribution: private Git repository only; npm publication and public release workflows are disabled
- Installation cutover: not implemented and not performed
- Native state schema: strict version 1; legacy version 4 is explicit import input only

The `opencode-loop` command marker and local acknowledgement-agent name are temporarily retained as command-protocol compatibility identifiers. They are not the plugin runtime identity.

## Daemon environment

- `OPENCODE2_CONFIGD_FAILED_RUN_RETRY_MS` sets the retry delay after a failed zero-delay run.
- `OPENCODE2_CONFIGD_TASK_DIR` overrides the Windows Task Scheduler artifact directory.
- `OPENCODE_BIN` and `SCHTASKS_BIN` retain their upstream executable-override semantics.

## State boundary

The plugin does not read or write old `.opencode/opencode-loop/` state as native state; it is explicit migration input only. Import is an operator-invoked copy into native v1, and the legacy source remains rollback authority and is never modified:

```sh
# Inspect only
node scripts/state-tool.mjs import-legacy-v4 \
  --source <legacy-v4-session.json> \
  --target .opencode/opencode2-config/<session>.json

# Apply once after review
node scripts/state-tool.mjs import-legacy-v4 \
  --source <legacy-v4-session.json> \
  --target .opencode/opencode2-config/<session>.json --apply
```

Apply refuses corrupt/unsupported sources, non-empty targets, and repeated source digests. Rollback means disable the new plugin and reactivate the old one against the untouched legacy source; it never reverse-writes legacy state.

Successful `handoff-contract/v1` compiler proposals can be attached to goal jobs with `state-tool.mjs attach-contract`. Native state stores only bounded mechanical contract fields and durable locators/digests—not prompts or raw context. Contract-aware completion requires criterion evidence plus a separate `state-tool.mjs attest-completion` record from the immutable `external-loop-evidence` authority. Worker goal tools cannot forge that attestation. Explicit `/loop-goal-done` remains a logged manual override and is marked as not ordinary evidence completion.

## Compaction boundary

Host automatic compaction is host-owned and native `/compact` remains user-invoked. OpenCode 2 does not expose plugin-scheduled native compaction. `/loop-compact`, compact jobs, and `--compact-every` therefore record `OPENCODE2_COMPACTION_MANUAL_REQUIRED`; they never claim compaction succeeded. Persist evidence/context references first, pause if needed, invoke `/compact` manually, then resume with `/loop-goal-resume`.

## Commands

The imported command surface remains unchanged: `/loop`, `/loop-ask`, `/loop-clear`, `/loop-cmd`, `/loop-command`, `/loop-compact`, `/loop-dev`, `/loop-doctor`, `/loop-export`, `/loop-goal`, `/loop-goal-blocked`, `/loop-goal-clear`, `/loop-goal-done`, `/loop-goal-pause`, `/loop-goal-resume`, `/loop-goal-status`, `/loop-help`, `/loop-init`, `/loop-logs`, `/loop-now`, `/loop-pause`, `/loop-progress`, `/loop-prompt`, `/loop-remove`, `/loop-resume`, `/loop-safe-dev`, `/loop-shell`, `/loop-status`, `/loop-stop`, and `/loop-testfix`.

## Verification

```sh
bun install --frozen-lockfile
bun run verify
```

See [`docs/provenance.md`](docs/provenance.md), [`docs/installation-architecture.md`](docs/installation-architecture.md), and the ADRs under [`docs/decisions/`](docs/decisions/).
