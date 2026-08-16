---
description: Orchestrate one context-preserving, implemented, verified, and independently reviewed change.
---

# Deliver change

## Main-Agent authority

REQUIRED SEMANTIC INVARIANT: the top-level main Cursor Agent is the sole orchestrator and final synthesizer. Main never edits project source and never runs project-mutating shell commands. It retains only intent, decisions, native Plan/Todo state, concise specialist findings, acceptance criteria, returned evidence, agent IDs, and reviewer verdicts. Broad read/search output belongs in built-in Explore, not main context.

DESIRED HOST ENFORCEMENT is currently unavailable for that exact split: Cursor children inherit the parent mode/tool envelope, so the host cannot deny main edits while allowing a writable child. This boundary is prompt-governed. Stay in Agent mode for the writable hierarchy. Plan Mode may support initial human-approved planning, then return to Agent mode; Ask/Plan cannot be expected to elevate a child to writable access.

## Required handoff packet

Every built-in or custom specialist receives: **GOAL**; **DECISION/QUESTION**; **IN SCOPE**; **OUT OF SCOPE**; **KNOWN CONTEXT**; **AUTHORITATIVE INPUTS**; **CONSTRAINTS**; **REQUIRED OUTPUT**; **DONE WHEN**; **STOP/ESCALATE WHEN**; declared authority; and a bounded curiosity budget. Every substantive result, including Explore output, must use the receipt contract from the shared `curiosity-delivery` rule. An implementer packet also includes explicit allowed paths, binary acceptance checks, approved dependency changes (or `none`), and verification evidence requirements.

## Parent Curiosity Gate

Apply the canonical classification, receipt contract, compactness limits, and gate semantics in `rules/curiosity-delivery.mdc`; do not reproduce its schema here.

- Missing, malformed, or weak receipt means no Todo or phase advancement. Resume the same child ID for one bounded repair; twice inadequate means `BLOCKED`, and do not replace a child to obtain a preferred answer.
- For internal or raw-evidence contradiction, raw evidence controls: resume the same ID for reconciliation. For conflicting children, do not vote or average; build a two-claim evidence map and authorize one bounded discriminating probe.
- A criterion-, security-, dependency-, irreversible-decision-, or review-affecting material unknown requires `BLOCKED` or `USER_DECISION_REQUIRED`. A reversible out-of-criteria unknown proceeds only with recorded consequence plus validation and rollback.
- Reject reviewer `PASS` with material unknown or raw failure and resume the same reviewer. Curiosity stays inside handoff authority and never creates an autonomous loop.

## Workflow

1. Clarify the outcome, constraints, non-goals, and binary acceptance criteria. Stop with `USER_DECISION_REQUIRED` when blocking ambiguity remains.
2. Create concise native Todo items as progress state. Do not depend on any undocumented Task or Todo schema.
3. Delegate broad repository discovery to built-in **Explore** with the handoff packet. Main consumes only concise architecture boundaries, relevant paths, tests/checks, and unresolved questions; it does not personally accumulate broad reads or search output.
4. Delegate bounded external research to `curiosity-researcher` and consequential trade-offs to `curiosity-strategist` only as needed. All specialists report directly to main. No nested delegation.
5. If initial human-approved planning is useful, use native Plan Mode, obtain approval, and return to Agent mode before writable delegation.
6. Dispatch exactly one bounded `curiosity-implementer`. One writable implementer at a time; no parallel writes. Preserve the returned implementer agent ID. Main does no implementation. If the implementer returns `BLOCKED`, resolve the decision or evidence gap and resume the same implementer ID.
7. The implementer applies `curiosity-implementation-discipline`. Before any behavior edit, it adds and executes a focused behavior test that fails for the intended reason. A discriminating probe may supplement that test; it may substitute only for non-behavior/documentation work or when a durable test is genuinely infeasible, which requires stopping and escalating or recording an explicit user-authorized exception under repository policy rather than silently proceeding. Characterization is not RED evidence, and unrelated failures do not count as RED. It then makes the minimal patch, runs project-supported checks, and returns `DONE` or `BLOCKED`, changed paths, raw evidence, and residual risk.
8. After `DONE`, launch a fresh independent `curiosity-reviewer` with criteria, diff/source anchors, and raw evidence. Preserve the reviewer ID. Accept `VERDICT: PASS` or `VERDICT: PASS_WITH_NOTES` only when it aligns with a valid receipt and no required criterion remains failed or missing.
9. `VERDICT: BLOCKED` or `CHANGES_REQUIRED` does consume one review cycle: resume the same implementer ID with findings, require a changed hypothesis or new evidence (no blind retry), reverify, then resume the same reviewer ID. Do not launch a replacement reviewer for re-review. A receipt-only repair consumes no review cycle when source and verdict are unchanged. Allow a maximum of two review cycles: a second blocked review terminates as `BLOCKED`, and curiosity cannot authorize a third cycle.
10. Synthesize the final evidence summary only after reviewer acceptance. Map each criterion to PASS/FAIL/MISSING; include reviewer verdict, changed paths, command outputs/status, unrun checks, and host/project uncertainty. Todo completion never overrides raw evidence.

## Dependency boundary

The plugin never installs or downloads its own runtime, tooling, SDK, package manager, or dependencies. A target-project dependency may be changed only by the assigned implementer after explicit user approval of the exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest and lockfile changes. Use existing or documented project machinery; never install globally, guess a manager, substitute `npx`, or use curl-pipe bootstrap. Stop on ambiguity and return command output/status, diff, and verification.
