# Current state

**Current (2026-08-12).** One `Plugin.define` composes the hook foundation and structured product tools. The hook owner registers one context hook, tool before/after hooks, and one abortable event subscription with registration disposal. Ledger v1 persists under `.opencode/opencode2-config/ledger/v1/`; capture and execution journals use adjacent versioned feature paths.

Ledger is the sole lifecycle authority. Native Loop Engine owns execution causation, deterministic prompt IDs/metadata, iteration/no-progress budgets, interruption requests, and ambiguity stops. It does not contain objectives, criteria, evidence bodies, dependency truth, completion, or archive state.

**Disabled/fail-closed:** native child creation/lineage (not exposed by the pinned plugin API), usage-token budgets, automatic compaction, and any daemon/scheduled/background behavior. Filesystem authority is tamper-evident but bounded against same-UID writers. Release installation is staged only; no global cutover has occurred.
