---
description: Route, implement, verify, and independently review one approved change.
---

# Deliver change

Main is the parent orchestrator and synthesizer only: it never edits source or runs project-mutating shell. This is a semantic invariant, not host enforcement. Built-in Explore owns broad repository discovery; only `curiosity-implementer` writes; all custom agents report to main and never delegate.

## Classify and route

Classify work `PROBE|BOUNDED|ARCHITECTURAL`; classification may only escalate and never de-escalate.

- **PROBE:** no persistent behavior change. Use minimal Explore and, only for external/version-sensitive facts, researcher.
- **BOUNDED:** local, reversible work inside an approved boundary. Use conditional planning only when useful, then one implementer followed by a fresh reviewer.
- **ARCHITECTURAL:** creates, chooses, or crosses a boundary involving public API/schema, migration, dependency posture, trust, deployment, spend, compatibility, or irreversibility. Route Explore → strategist and optional researcher → explicit owner decision → implementer → reviewer. No edit precedes that decision.

Run the owner sweep: public API/config; data/persistence/migration/retention; dependency/license/supply chain; security/privacy/trust; deployment/operations; compatibility/rollout; paid service/spend; reversibility/rollback. Stop with `USER_DECISION_REQUIRED` for an unresolved consequential choice.

## Handoffs and context

A compact Explore or routine-review handoff may omit irrelevant full fields. Every writable or consequential full handoff includes: WORK CLASS; GOAL and decision/question; REQUIRED SKILLS with why; authority granted/withheld; IN SCOPE and OUT OF SCOPE; repository-relative paths/symbols; known context and authoritative inputs; approved architecture decisions; binary acceptance criteria; evidence required; and STOP/ESCALATE conditions. REQUIRED SKILLS is semantic, not a documented programmatic attachment; agents block with `SKILL_UNAVAILABLE` when unavailable. Never claim a hidden attachment or file-pointer API.

Governance seeds, not performance claims: handoff ≤900 words excluding verbatim requirements/path lists; specialist synthesis ≤1200 words excluding exact excerpts/receipt; evidence capsule ≤150 words; receipt ≤180 words; agents target ≤350 words. Main retains decisions, pointers, capsules, agent IDs, and verdicts—not raw search, log, or process history.

## Sequence

1. Clarify intent and binary criteria. Create concise native Todo state; do not rely on undocumented Todo schemas.
2. Explore only as routing requires. Apply the Curiosity Gate from the rule to every substantive child result.
3. Plan conditionally; obvious bounded work needs no ceremony. Obtain owner decisions before architecture work.
4. Dispatch exactly one implementer with both implementation and architecture skills. Preserve its ID. It must obtain focused intended RED before behavior edits, protect dirty work, return an Architecture Boundary Card, make the smallest patch, audit allowed paths, and supply separate RED/GREEN/VERIFY capsules.
5. After `DONE`, launch a fresh reviewer with the independent-review skill. Preserve its ID. Accurately distinguish independent execution from evidence audit, and accept `PASS|PASS_WITH_NOTES` only through the rule's canonical passing-verdict evidence gate.
6. For `CHANGES_REQUIRED|BLOCKED`, resume the same implementer ID, then the same reviewer ID for scoped re-review. A receipt-only repair does not consume a cycle; a source correction does. Maximum two review cycles; no third cycle.
7. Synthesize criterion `PASS|FAIL|MISSING`, changed paths, decisive evidence, reviewer verdict, unrun checks, and uncertainty. Finalize only after a passing verdict clears that gate; Todo state never overrides evidence.

A missing or weak receipt gets one same-ID repair. Contradictions use raw evidence and one bounded discriminating probe. A material criterion/security/dependency/review unknown blocks. Curiosity stays bounded and starts no autonomous loop.

Dependencies require explicit user approval for exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest/lockfile changes. Never install globally, guess a manager, substitute `npx`, or use curl-pipe bootstrap; stop on ambiguity.
