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

The `opencode-loop` command marker and local acknowledgement-agent name are temporarily retained as command-protocol compatibility identifiers. They are not the plugin runtime identity.

## Daemon environment

- `OPENCODE2_CONFIGD_FAILED_RUN_RETRY_MS` sets the retry delay after a failed zero-delay run.
- `OPENCODE2_CONFIGD_TASK_DIR` overrides the Windows Task Scheduler artifact directory.
- `OPENCODE_BIN` and `SCHTASKS_BIN` retain their upstream executable-override semantics.

## State boundary

The plugin does not read or write old `.opencode/opencode-loop/` state as native state. That directory is future explicit one-time migration input only. No migration tool exists in this bootstrap, and installed behavior remains untouched.

## Commands

The imported command surface remains unchanged: `/loop`, `/loop-ask`, `/loop-clear`, `/loop-cmd`, `/loop-command`, `/loop-compact`, `/loop-dev`, `/loop-doctor`, `/loop-export`, `/loop-goal`, `/loop-goal-blocked`, `/loop-goal-clear`, `/loop-goal-done`, `/loop-goal-pause`, `/loop-goal-resume`, `/loop-goal-status`, `/loop-help`, `/loop-init`, `/loop-logs`, `/loop-now`, `/loop-pause`, `/loop-progress`, `/loop-prompt`, `/loop-remove`, `/loop-resume`, `/loop-safe-dev`, `/loop-shell`, `/loop-status`, `/loop-stop`, and `/loop-testfix`.

## Verification

```sh
bun install --frozen-lockfile
bun run verify
```

See [`docs/provenance.md`](docs/provenance.md), [`docs/installation-architecture.md`](docs/installation-architecture.md), and the ADRs under [`docs/decisions/`](docs/decisions/).
