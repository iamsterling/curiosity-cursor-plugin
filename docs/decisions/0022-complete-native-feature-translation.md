# ADR 0022: Complete native feature translation

**Status:** Accepted, 2026-08-15.

## Decision

Ship one verb-dispatching `/curiosity-engineering <explore|propose|apply|update|status|verify|finish>` skill and six explicit Cursor agents. Four remain read-only advisors; `curiosity-worker` and `curiosity-implementer` are writable, bounded subagents for exact accepted ready Todos. The normative contract is [`../specs/cursor-native-engineering-workflow.md`](../specs/cursor-native-engineering-workflow.md).

The workflow adapts proposal/delta/scenario discipline studied from Fission-AI/OpenSpec and hierarchy/dependency/readiness/worker concepts studied from `gastownhall/beads` v1.1.0 into Cursor Plan Mode, Agent Todos, Task, AskQuestion, sessions, evidence, and explicit user finish confirmation. It is custom and not compatible with either source. No source runtime, file format, command, ID, graph, storage, scheduler, service, MCP, claims/leases, sync/federation, archive, or lifecycle authority is introduced.

Risk is deterministic: low-risk behavior-preserving changes may use a concise lite contract; behavior, security, architecture, data, public contract, or ambiguous consequential changes require the full contract. Material drift stops edits for renewed acceptance. Verification separately checks completeness, correctness, and coherence. `finish` never self-completes and always requires explicit user confirmation after evidence and unresolved work are shown.

The inert hook remains `{}` with zero follow-up and is not translated capability. Common stop fields do not correlate accepted Plans and Todos; transcript parsing remains prohibited. Static schema/prompt tests are implementation evidence only. No live Cursor/model smoke was authorized, so runtime discovery, tool availability, delegation, and compliance remain unverified.

## Consequences

The parent retains coordination, overlap prevention, evidence reconciliation, and user-facing finish. Writable children cannot coordinate other agents or claim completion. Rollback reverts the 0.3.0 skill/agents/manifest/docs changes; installation, ordinary Cursor trust/account/session state, and publication are out of scope.
