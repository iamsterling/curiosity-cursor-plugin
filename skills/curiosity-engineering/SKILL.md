---
name: curiosity-engineering
description: Dispatch a Cursor-native, risk-scaled engineering contract through explore, propose, apply, update, status, verify, and user-confirmed finish.
---

# Curiosity engineering

Invoke as `/curiosity-engineering <explore|propose|apply|update|status|verify|finish>`. The model may also select this skill. For an unknown or missing verb, print usage and make no edits.

## Universal rules

- The user's latest explicit instructions, repository instructions, and accepted native plan are authoritative. Skip, cancel, rejection, silence, unavailable interaction, and ambiguity mean do not infer consent; stop without edits when consent or a material answer is required.
- Use AskQuestion for material ambiguity with neutral bounded options and a user-supplied alternative. AskQuestion may be unavailable or nonblocking: disclose the limitation, repeat the neutral question in chat, and stop for an answer.
- Require the user to select Cursor Plan Mode for proposals. This skill cannot switch Plan Mode and must never claim it did.
- Keep workflow information in Cursor-owned Plan Mode, Agent Todos, session, and returned Task context. Create no plugin-owned state and no custom lifecycle runtime. Do not parse transcripts.
- Verify named evidence before completing any Todo. Mandatory failed or missing evidence leaves every affected Todo and the overall change **blocked** or **unverified**, never “all done.” User confirmation cannot waive mandatory evidence. Changing or removing an evidence requirement is material drift and requires `update`, a revised native Plan, and renewed native Plan acceptance.
- This is custom and not compatible with OpenSpec or Beads. It creates no OpenSpec implementation, no Beads implementation, no MCP integration, and no completion authority; no source assets, commands, IDs, storage, graph, scheduler, service, claim/lease, sync, federation, archive, or lifecycle authority.

## Native change contract and risk

Every proposal uses these labeled sections, in order:

1. **Identity and intent/problem**
2. **Current behavior**, separating fact, inference, and unknown
3. **Behavioral delta: ADD / CHANGE / REMOVE** (write “none” where applicable)
4. **Scope and non-goals**
5. **Observable requirements** as binary checks
6. **Happy, error, and edge scenarios** with observable outcomes
7. **Design constraints and decisions**
8. **Agent Todo hierarchy**; every Todo names an observable evidence item and includes dependencies, readiness, blocked reason, unblock condition, exclusive ownership when delegated, and evidence requirements
9. **Rollback**
10. **Unresolved assumptions** and whether each blocks work
11. **Completion criteria**

Use the **lite profile** only for demonstrably low-risk, behavior-preserving documentation, typo, formatting, or mechanical metadata work. Lite keeps every heading but may be concise and needs at least one happy scenario. Use the **full behavioral contract** for behavior, bugs, security/privacy/auth/data, persistence, concurrency, migration, dependencies, package/architecture boundaries, destructive work, public configuration, consequential reliability/performance, or uncertain blast radius. Full requires detailed happy, error, and edge scenarios and all Todo dependency/evidence fields. Missing scenarios in a full profile makes it unready and unacceptable.

Deterministic escalation: any full trigger selects full. If risk, behavior, scope, constraint, or evidence needs are ambiguous, use AskQuestion and stop rather than guess. Lite is allowed only with evidence that behavior, security posture, public contract, data, dependencies, and architecture stay unchanged. Escalation can occur at any action; de-escalation requires explicit user agreement.

## Action dispatch

### `explore`

Make no edits and no implementation Todos. Clarify intent/problem, current behavior, boundaries, and unknowns. Label material findings **fact**, **inference**, or **unknown**. May AskQuestion under the universal nonblocking/cancellation rules.

### `propose`

Require the user to select Plan Mode; do not claim to switch it. Inspect relevant source and architecture boundaries, choose the risk profile deterministically, and build the complete native change contract. Ask instead of inventing consequential details. Require explicit native plan acceptance. Without explicit acceptance there are no implementation Todos and no edits.

### `apply`

Apply only the accepted plan. Project the Todo hierarchy, dependencies, readiness, blocked reason, unblock condition, ownership, and evidence into native Agent Todos. A Todo is ready only after every dependency has passing evidence and no blocker remains. Never select, assign, or delegate a blocked Todo.

For behavior changes, add a failing behavior test first; characterize existing untested behavior before editing it. Make the smallest root-cause change and preserve package boundaries and diagnostics. The parent may assign an exact ready Todo through Task to `curiosity-worker` for narrow mechanical bounded work or `curiosity-implementer` for normal scoped implementation. A complete child prompt/handoff must include plan context, exact Todo, binary acceptance, dependencies/readiness evidence, exclusive file ownership, prohibited paths/non-goals, test-first duty, named checks/evidence, return format, and stop conditions. Parallel work is allowed only in an authorized parallel group with independent dependencies and non-overlapping ownership. The parent retains coordination, evidence reconciliation, verification, and the boundary against claiming completion.

Every reviewer Task prompt must repeat this boundary: `curiosity-reviewer` receives only the accepted native plan/change contract, explicitly bounded current source, the diff, explicit test/evidence outputs, and bounded task context. Transcript parsing or read access and session state access are prohibited. Missing review context must be requested from the parent, not retrieved from transcript or session state.

### `update`

Compare new information to the accepted contract. A change to intent, scope/non-goals, observable behavior/scenarios, constraints/decisions, or evidence/completion requirements is material drift: invalidate acceptance, stop edits, revise the native Plan and affected ADD/CHANGE/REMOVE and Todos, then require renewed native Plan acceptance before resuming. Chat clarification, a chat choice, or chat confirmation is not reacceptance. If native Plan Mode or native Plan acceptance is unavailable, remain blocked. Minor implementation details may update without reacceptance only when behavior, scope, constraints, and evidence requirements remain unchanged; record why. If materiality is ambiguous, AskQuestion and stop.

### `status`

Identify the intended native plan and reconstruct only from the Cursor-owned plan, Agent Todos, session, and returned Task context. Classify each item **complete**, **active**, **ready**, **blocked**, or **unverified**. Report dependencies, blocked reason/unblock condition, mapped evidence and raw failures, delegation results, drift, and acceptance state. Passing evidence is required for complete; mandatory failed or missing evidence keeps the affected Todo and overall change blocked or unverified, never all done. If plan identity or correlation is ambiguous, ask the user and stop—never infer ambiguous status. No transcript parsing or plugin state.

### `verify`

Preserve raw failures and never weaken tests. Verify all dimensions:

- **Completeness:** every requirement, happy/error/edge scenario, and Todo has passing evidence; never mark failed or missing evidence complete.
- **Correctness:** behavior, error paths, edge cases, regression/characterization, and required type/lint/build/schema/security checks match the contract.
- **Coherence:** implementation matches the accepted design/delta or a material update was reaccepted; reject contradictory docs, scope expansion, overlapping ownership, and unsupported claims.

Delegation without returned evidence is unverified, not complete. Reconcile returned diffs/evidence with the plan. Separate static/prompt-level guarantees from live-unverified Cursor behavior; do not fake model execution.

### `finish`

Always run `verify`. Summarize identity/intent, accepted delta, diff/paths, tests and raw failures, mapped evidence, unresolved assumptions, deferred work, delegation gaps, and rollback. `finish` must not solicit or accept completion confirmation until all mandatory evidence passes. Mandatory failed or missing evidence keeps finish blocked or unverified; user confirmation cannot waive it. Only after all mandatory evidence passes, use a native question to request explicit user completion confirmation. If the interaction is unavailable/nonblocking, ask in chat and stop. Without explicit user confirmation the work is unfinished. Never self-confirm, self-complete, or treat silence as confirmation.

## Collaboration and continuation bounds

Read-only `curiosity-researcher`, `curiosity-reviewer`, and `curiosity-strategist` may provide bounded advice. `curiosity-coordinator` may route only accepted, ready Todos to the writable agents when Task is available. Children must not coordinate other agents, expand scope, bypass blockers, or claim plan/parent completion. No two concurrent children may overlap file ownership or execute dependent Todos. Report unavailable or failed delegation honestly; do not claim work occurred.

There is no automatic continuation. For `status`, `apply`, `verify`, or `finish` after interruption, identify the intended plan from native context and ask on ambiguity. The inert stop hook always returns `{}`, provides zero follow-up, and is not a workflow capability. Current common stop fields including `conversation_id`, `generation_id`, `workspace_roots`, and `transcript_path` do not establish Plan/Todo correlation; transcript parsing remains prohibited.
