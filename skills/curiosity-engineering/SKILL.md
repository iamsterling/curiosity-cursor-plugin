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
- Native Todo status and checkmarks are attempted-work/progress projections only and MAY be inconsistent with evidence because of host/model behavior. Todo `completed` and the host's `All done` display never prove a requirement, scenario, change, or finish complete. Phrase evidence-command Todos as `execute <command> and capture exit/output`, never as “command must pass,” and put `# [curiosity-evidence/v1] check=<slug>` within each evidence shell command's first 256 characters: execution may be checked while its outcome is evaluated separately.
- After any execution or delegation, the parent performs a prompt-level **Verification Gate**. Map every mandatory requirement, scenario, and evidence command to its raw result and **PASS/FAIL/MISSING**. Any FAIL/MISSING makes the gate **BLOCKED/UNVERIFIED** regardless of native Todo state or a user's attempt to confirm. User confirmation cannot waive it. Changing or removing evidence requirements is material drift and requires `update`, a revised native Plan, and renewed native Plan acceptance.
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
8. **Agent Todo hierarchy**; every Todo names attempted work, dependencies, readiness, blocked reason, unblock condition, exclusive ownership when delegated, and evidence requirements; evidence commands use `execute <command> and capture exit/output`
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

For behavior changes, add a failing behavior test first; characterize existing untested behavior before editing it. Make the smallest root-cause change and preserve package boundaries and diagnostics. The parent may assign an exact ready Todo through Task to `curiosity-worker` for narrow mechanical bounded work or `curiosity-implementer` for normal scoped implementation. Every writable Task's first nonempty line is `[curiosity-handoff/v1]`, followed by the exact ordered Role, Mode, Plan-Accepted, Todo, Acceptance, Dependencies, Readiness-Evidence, Owned-Paths, Prohibited-Paths, Transcript-Access, Session-State-Access, Checks, Test-First, Return, Stop-Conditions, and Non-Goals headers, then `---` and a nonempty body, as specified in `docs/specs/cursor-hook-mesh.md`. Owned-Paths states exclusive file ownership. The complete child prompt/handoff uses the exact Return value `changed paths; diff summary; raw command output and exit status; mapped evidence; blockers; failures; assumptions`. Worker and implementer must stop on a missing or invalid marker/contract. Parallel work is allowed only in an authorized parallel group with independent dependencies and non-overlapping ownership. The parent retains coordination, evidence reconciliation, verification, and the boundary against claiming completion.

Advisor Tasks remain unmarked because the v1 marker is reserved for writable worker/implementer Tasks. Every reviewer Task prompt must repeat this boundary: `curiosity-reviewer` receives only the accepted native plan/change contract, explicitly bounded current source, the diff, explicit test/evidence outputs, and bounded task context. Transcript parsing or read access and session state access are prohibited. Missing review context must be requested from the parent, not retrieved from transcript or session state.

After each parent execution or child handoff returns, run the Verification Gate against raw output. Worker, implementer, reviewer, and coordinator handoffs return raw evidence; the parent owns reconciliation. Never derive evidence success from Todo status.

### `update`

Compare new information to the accepted contract. A change to intent, scope/non-goals, observable behavior/scenarios, constraints/decisions, or evidence/completion requirements is material drift: invalidate acceptance, stop edits, revise the native Plan and affected ADD/CHANGE/REMOVE and Todos, then require renewed native Plan acceptance before resuming. Chat clarification, a chat choice, or chat confirmation is not reacceptance. If native Plan Mode or native Plan acceptance is unavailable, remain blocked. Minor implementation details may update without reacceptance only when behavior, scope, constraints, and evidence requirements remain unchanged; record why. If materiality is ambiguous, AskQuestion and stop.

### `status`

Identify the intended native plan and reconstruct only from the Cursor-owned plan, Agent Todos, session, and returned Task context. Report the native Todo attempted-work/progress projection separately from the Verification Gate's requirement/scenario/evidence-command PASS/FAIL/MISSING map. Explicitly call out contradictions such as native `All done` plus failed evidence; the gate remains BLOCKED/UNVERIFIED. Also report dependencies, blockers, delegation, drift, and acceptance state. If plan identity or correlation is ambiguous, ask the user and stop—never infer ambiguous status. No transcript parsing or plugin state.

### `verify`

Preserve raw failures and never weaken tests. Verify all dimensions:

- **Completeness:** every mandatory requirement, happy/error/edge scenario, and evidence command maps to a raw result and PASS/FAIL/MISSING in the Verification Gate.
- **Correctness:** behavior, error paths, edge cases, regression/characterization, and required type/lint/build/schema/security checks match the contract.
- **Coherence:** implementation matches the accepted design/delta or a material update was reaccepted; reject contradictory docs, scope expansion, overlapping ownership, and unsupported claims.

Delegation without returned evidence is MISSING and the gate is BLOCKED/UNVERIFIED. Reconcile returned diffs/evidence with the plan. Native Todos may still display `completed` or `All done`; this static/model-mediated instruction cannot prevent that host behavior. Separate static/prompt-level guarantees from live-unverified Cursor behavior; do not fake model execution.

### `finish`

Always run `verify` and show the Verification Gate before requesting completion confirmation. Summarize identity/intent, accepted delta, diff/paths, tests and raw failures, mapped evidence, unresolved assumptions, deferred work, delegation gaps, and rollback. Ask for explicit user confirmation only when the Verification Gate is PASS. Any FAIL/MISSING keeps finish BLOCKED/UNVERIFIED regardless of Todo state or a user's attempt to confirm; confirmation cannot waive it. Changing evidence requirements requires `update` and revised native Plan acceptance. If the interaction is unavailable/nonblocking, ask in chat and stop. Without explicit confirmation after Gate PASS, work is unfinished. Never self-confirm, self-complete, or treat silence as confirmation.

## Collaboration and continuation bounds

Read-only `curiosity-researcher`, `curiosity-reviewer`, and `curiosity-strategist` may provide bounded advice. `curiosity-coordinator` may route only accepted, ready Todos to the writable agents when Task is available. Children must not coordinate other agents, expand scope, bypass blockers, or claim plan/parent completion. No two concurrent children may overlap file ownership or execute dependent Todos. Report unavailable or failed delegation honestly; do not claim work occurred.

There is no automatic continuation. For `status`, `apply`, `verify`, or `finish` after interruption, identify the intended plan from Cursor-owned Plan, native Todos, Task context, source, and evidence, and ask on ambiguity. The stateless command-hook mesh provides bounded permission decisions and guidance only; it does not restore, follow up, parse transcripts, or own workflow state.
