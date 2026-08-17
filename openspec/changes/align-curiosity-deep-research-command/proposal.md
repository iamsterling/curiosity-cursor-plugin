# Change: Align the dedicated `/curiosity-deep-research` contract

## Why

`/curiosity-deep-research` already exists, but it has no dedicated OpenSpec-compatible change package. Its short prompt names the correct researcher and skill without fully specifying budgets, network authority, evidence labels, status dimensions, migration, or binary verification. That leaves important behavior implicit and makes static conformance difficult to review.

## What changes

- Specify the exact semantic route: main dispatches exactly one `curiosity-researcher` Task requiring `curiosity-research-evidence` and never dispatches an implementer.
- Keep main and the researcher read-only; main reconciles only the compressed child result and never emulates specialist research.
- Require a bounded decision frame plus explicit source and time budgets, a stopping rule, and decision-changing unknowns.
- Define the claim taxonomy, source hierarchy, citations, contradictions, negative results, evidence origins, confidence labels, and decision verdicts.
- Permit one bounded curiosity pass for the highest-value authorized probe and require explicit `CURIOSITY_NO_GO` entries for rejected threads.
- Require explicit external-network authorization before external access and stable routing, authority, and evidence statuses when work cannot proceed or evidence remains insufficient.
- Preserve the canonical receipt and parent Curiosity Gate, including one same-child bounded repair for a malformed result.
- Document Cursor's semantic-only Task, skill, read-only, network, and model limitations.

## Capability

### New specification capability

- `curiosity-deep-research-command`: manual, bounded, read-only decision research through the existing researcher and evidence skill.

This package specifies and aligns an existing command; it does not add a command to the installed inventory.

## Dependencies

- Existing `commands/curiosity-deep-research.md`.
- Existing `curiosity-researcher` agent and required `curiosity-research-evidence` skill.
- Existing always-applied `curiosity-delivery` rule, receipt, Curiosity Gate, and authority boundary.
- Cursor's native Task and network/tool permission envelope, where available.

No package, CLI, runtime, hook, service, executable, or target-project dependency is added.

## Non-goals

- Implementing, editing, persisting, or otherwise mutating any workspace or temporary-path content.
- Dispatching `curiosity-implementer`, built-in Explore, a strategist, reviewer, or a second researcher as part of this command.
- Giving main permission to browse, conduct searches, reproduce the research, or emulate an unavailable specialist.
- Selecting architecture, making an owner decision, or converting evidence into implementation authority.
- Guaranteeing Task scheduling, skill attachment, read-only enforcement, network confinement, model identity, or source availability in Cursor.
- Installing or invoking OpenSpec or any other CLI.
- Treating search volume, unsupported summaries, Todo state, or a receipt alone as proof.

## Migration and rollout

This is a contract-alignment change for an existing command. The command name, installed count, agent count, skill count, rule count, and file-only product boundary remain unchanged. Later implementation may tighten the command prompt and focused static tests without adding aliases, state, dependencies, or data migration. Verification requires static contract checks and, when a separately authorized isolated Cursor session is available, a live smoke test whose semantic evidence is reported separately.

## Risks

- **Prompt-only routing and authority:** Cursor does not guarantee that prose attaches a skill or prevents writes. Mitigation: stable fail-closed statuses and no capability-enforcement claim.
- **Network ambiguity:** read-only does not itself authorize external access. Mitigation: explicit network authorization check and `BLOCKED_AUTHORITY: NETWORK_UNAUTHORIZED`.
- **False certainty:** polished summaries can hide single-source, contradictory, or stale evidence. Mitigation: claim/evidence labels, scoped citations, contradictions, negative results, and evidence status.
- **Parent re-research:** reconciliation can expand into specialist emulation. Mitigation: compressed reconciliation is limited to checking the question, receipt, evidence map, gaps, and decision impact.
- **Unbounded inquiry:** follow-up threads can consume time without changing the decision. Mitigation: source/time budgets, one curiosity pass, `CURIOSITY_NO_GO`, and canonical stop reasons.

## Binary acceptance

1. PASS only if the command dispatches exactly one `curiosity-researcher` Task requiring `curiosity-research-evidence`.
2. PASS only if no implementer or other specialist is dispatched and main does not emulate specialist research.
3. PASS only if main and the researcher perform no file writes or mutating shell actions.
4. PASS only if the handoff declares a decision frame, source budget, time budget, stopping rule, and decision-changing unknowns.
5. PASS only if output uses the exact claim taxonomy, primary-source hierarchy, scoped citations, contradiction and negative-result records, evidence-origin labels, confidence labels, and per-question verdicts.
6. PASS only if one highest-value authorized curiosity probe is permitted and rejected threads are explicit `CURIOSITY_NO_GO` entries.
7. PASS only if external access requires explicit authorization and absent authority fails closed without network use.
8. PASS only if routing, authority, and evidence statuses are separately reported with stable values and reasons.
9. PASS only if main performs compressed reconciliation without repeating searches and applies the canonical receipt gate, including at most one same-child repair.
10. PASS only if static and live evidence are distinguished and Cursor semantic limitations are explicit.

## Impact

This package authorizes no implementation. Expected later touch points are the existing command prompt and focused static/live-smoke tests only if separately approved; broader docs may be updated only where repository conventions require them.

## Integrated authority note (2026-08-17)

ADR 0033 and the canonical rule supersede any package-local assumption that a writable route may skip specification, treat persistence as optional, use a different writer for persistence, or treat Plan/Todo/tasks as authority. Read-only invocation remains proportional; if it transitions to mutation, automatic specification, exact approval, immutable persistence, same-Task linkage, and all declared required checks apply. This package remains an OpenSpec-compatible planning and history input, not formal OpenSpec adoption.
