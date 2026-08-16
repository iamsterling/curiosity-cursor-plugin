# ADR 0028: Hierarchical context preservation

> ADR 0030 refines this hierarchy for 0.6 with role-bound composable skills; the authority and parent-context decision remains in force.

**Status:** Accepted
**Date:** 2026-08-16

## Context

The sanitized usage aggregate records child activity dominated by `general` (53.1%) and `explore` (23.0%), while the observed delivery motif is discover/search/read → edit/patch → project checks → independent review. The earlier inference removed a custom implementer and let main absorb implementation. That optimized inventory size, but not parent-context quality: broad discovery and patch mechanics consume the same context needed to preserve intent, decisions, acceptance criteria, evidence, IDs, and review state.

Usage frequency does not imply that main should personally perform the work. Dominant general/edit and Explore activity identifies the highest-volume context to offload. Cursor's built-in Explore can isolate broad repository output, while a bounded writable implementer can isolate patch and verification detail. Main can then synthesize from concise findings and evidence rather than accumulate raw reads, searches, edits, and test logs.

## Decision

Make context quality and parent-context preservation the optimization function. The top-level main Cursor Agent is the sole orchestrator and final synthesizer. It retains only intent, decisions, native Plan/Todo state, concise specialist findings, binary acceptance criteria, returned evidence, agent IDs, and reviewer verdicts.

Broad repository exploration is delegated to built-in Explore. Researcher and strategist remain read-only. Add one writable `curiosity-implementer` as the sole source editor for one bounded assignment; it cannot delegate or orchestrate. Launch a fresh read-only reviewer after implementation. Resume the same implementer ID after a block or finding and the same reviewer ID after corrections. All custom specialists report directly to main; nested delegation and parallel writes are forbidden.

The handoff packet is fixed: GOAL; DECISION/QUESTION; IN SCOPE; OUT OF SCOPE; KNOWN CONTEXT; AUTHORITATIVE INPUTS; CONSTRAINTS; REQUIRED OUTPUT; DONE WHEN; STOP/ESCALATE WHEN. Implementer handoffs add allowed paths, acceptance checks, approved dependency changes, and verification evidence requirements.

**Required semantic invariant:** main never edits project source or runs project-mutating shell commands. **Desired host enforcement / known limitation:** Cursor cannot currently deny main edits while allowing a writable child because child mode/tool access inherits from the parent. The invariant is prompt-governed, not capability-enforced. Writable hierarchy therefore remains in Agent mode. Plan Mode may support initial human approval before returning to Agent mode; Ask/Plan cannot be expected to elevate a writable child.

ADR 0027 remains controlling for the Cursor-only, file-only product boundary. This ADR changes orchestration within that boundary and adds no runtime, hooks, MCP, SDK, daemon, state store, custom mode, or executable.

## Rejected alternatives

1. **Main edits after Explore.** Rejected because patch/test detail still degrades parent context and violates separation of orchestration from bounded execution.
2. **Main performs broad discovery.** Rejected because the dominant 23.0% Explore activity is precisely the high-volume context built-in Explore can isolate.
3. **Multiple implementers or parallel writes.** Rejected because overlapping diffs, evidence, and ownership undermine deterministic review and context lineage.
4. **Nested specialist delegation.** Rejected because main would lose direct agent-ID, evidence, and decision authority.
5. **Plan/Ask parent with writable child elevation.** Rejected because current inheritance does not provide that capability; return to Agent mode instead.
6. **Claim host-enforced main denial.** Rejected as false. Prompt governance is explicit until Cursor exposes independent parent/child permission envelopes.
7. **Hooks, scripts, MCP, SDK, external runtime, custom mode, daemon, or state store.** Rejected to preserve ADR 0027's file-only boundary and avoid hidden orchestration state.

## Consequences

The installed inventory becomes four agents, one skill, one command, and one rule. Static tests can prove declarations and wording, not live compliance, permission enforcement, model identity/fallback, child resumption, or nesting behavior. Those uncertainties remain in the unexecuted live smoke plan.
