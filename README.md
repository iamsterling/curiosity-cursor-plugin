# OpenCode2 Config

Private OpenCode 2 Promise-compatible plugin pinned to `@opencode-ai/plugin@0.0.0-next-17403`.

## Product architecture

- **Ledger Authority v1:** immutable event authority for intent, capability/delta framing, criteria, work, claims, typed evidence, approvals, reconciliation, archive lineage, facts, audit and capture gaps.
- **Native Loop Engine:** same-root-session execution journal using native prompt/interrupt/event primitives only.
- **Hook foundation:** durable event envelopes, bounded provenance-labelled context, tool observations and compaction/event capture.
- **Structured tools:** closed schemas for Ledger proposals, claims, evidence, reviews, approvals and loop control.

State belongs under `.opencode/opencode2-config/`. Unknown schema versions and corruption are rejected. Raw prompts and tool output are not persisted by default. Worker/model/synthetic/plugin/tool input cannot approve or directly complete work.

The imported loop runtime, daemon, timers, polling, shell/process/git/watch scheduler, mutable state authority and marker agent are removed. `/loop-*` files are thin compatibility aliases or stable unsupported diagnostics.

```sh
bun install --frozen-lockfile
bun run verify
```

Installation creates a reviewed candidate; global cutover requires separate authorization.
