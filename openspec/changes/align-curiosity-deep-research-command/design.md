# Design: Bounded deep-research route

## Context

The product is a Cursor-only, file-only prompt bundle. The existing command is a semantic routing prompt: checked-in Markdown cannot programmatically schedule a Task, attach a skill, enforce read-only behavior, grant network access, or guarantee the preferred model. The canonical rule nevertheless requires main to orchestrate and synthesize only, keeps the researcher read-only, and makes raw evidence plus a structured receipt control advancement.

Deep research serves a bounded decision, not general knowledge collection. The design therefore separates routing, authority, and evidence outcomes and makes limits visible rather than allowing main to fill gaps.

## Goals

- Preserve exact command → researcher → research-evidence routing.
- Produce decision-serving, traceable evidence within explicit source and time budgets.
- Keep every participant read-only and prohibit implementer routing.
- Fail closed on unavailable routing or unauthorized external access.
- Make uncertainty, contradictions, negative results, and rejected inquiry visible.
- Keep parent context consumption small through compressed reconciliation.

## Non-goals

- Workspace mutation, persistence, implementation, architecture selection, or broad repository discovery.
- Multiple researchers, nested delegation, autonomous follow-up, or exhaustive literature review.
- Host-enforced guarantees or a new runtime/status store.
- Inferring live Cursor behavior from static prompt inspection.

## Decision 1: Exact single-specialist routing

After determining that the request is a bounded external or version-sensitive decision question, main dispatches exactly one `curiosity-researcher` Task. The handoff requires `curiosity-research-evidence` by name. No implementer or other custom specialist is dispatched, and the researcher does not delegate. Repository discovery remains outside this route; parent-supplied repository facts must be labeled rather than independently rediscovered by the researcher.

If Task dispatch is unavailable, main reports routing `BLOCKED_ROUTING` with `TASK_UNAVAILABLE`. If the started researcher reports the skill unavailable, main reports `BLOCKED_ROUTING` with `SKILL_UNAVAILABLE`. Main never substitutes a generic research procedure or produces researcher-equivalent findings.

## Decision 2: Bounded handoff contract

Before dispatch, main states:

1. the decision question and who will use the answer;
2. in-scope and out-of-scope claims;
3. the alternatives or decision threshold, where known;
4. decision-changing unknowns;
5. a numeric maximum source budget;
6. a wall-clock or equivalent bounded time budget;
7. an explicit stopping rule using `COVERAGE|SATURATION|EXHAUSTION|BLOCKED`;
8. permitted source classes and applicable version/date/population scope;
9. external-network authorization status; and
10. the required compressed output contract.

Missing source or time bounds are blocking ambiguity rather than permission for open-ended research.

## Decision 3: Network and mutation authority are explicit

The command grants no mutation authority. Main and the researcher do not edit, write, delete, persist, or run mutating shell commands against workspace or temporary paths. Native conversational orchestration is allowed, but no implementer is needed because the command has no write phase.

External network use proceeds only when the user request and current Cursor/tool permission envelope explicitly authorize it. Read-only metadata alone is not network authorization. If external evidence is required but authorization is absent or denied, authority is `BLOCKED_AUTHORITY` with `NETWORK_UNAUTHORIZED`; no network attempt is made. A request to save or implement findings produces `BLOCKED_AUTHORITY` with `WRITE_REQUESTED` for this command and must be handled, if desired, through a separately invoked delivery route.

## Decision 4: Evidence method and source hierarchy

Each material claim has exactly one claim type:

- `FACT`
- `VENDOR_CLAIM`
- `ACADEMIC_FINDING`
- `INFERENCE`
- `UNKNOWN`

Sources are selected in this order when applicable: (1) controlling standards, laws, first-party specifications, official documentation, source code, release artifacts, and original datasets; (2) original peer-reviewed research; (3) reputable independent technical or institutional analysis; (4) secondary summaries; and (5) discovery-only aggregators or search snippets. Lower tiers do not silently override available higher-tier evidence. Consequential claims require triangulation or an explicit single-source limitation.

Every citation records a stable locator or URL, title/publisher, direct claim origin, access date, applicable publication or product version/date, and relevant population and scope. Search snippets are leads, not evidence. Exact excerpts are clearly distinguished from paraphrase.

Contradictions map both claims and source scopes without voting. One discriminating probe may be selected as the curiosity pass. Negative results record the searched source class/query or method, bounded extent, date, and what was not found; absence of a result is not proof of absence unless the source and method support that conclusion.

## Decision 5: Evidence origins, confidence, and verdicts

Each ledger item has one evidence origin:

- `RESEARCHER_OBSERVED`: the researcher directly inspected the cited source.
- `PARENT_SUPPLIED`: main supplied the fact or source without child verification.
- `WORKSPACE_ARTIFACT`: evidence comes from a named read-only workspace artifact supplied to the route.
- `UNVERIFIED_SUMMARY`: a summary cannot be traced to directly inspected evidence.

Each material claim receives `HIGH|MEDIUM|LOW` confidence with a short basis tied to source authority, agreement, recency, and scope fit. Confidence is not probability and cannot erase contradictions. `UNVERIFIED_SUMMARY` cannot establish a supported consequential conclusion.

Each decision question receives `SUPPORTED|FALSIFIED|UNRESOLVED|NOT_APPLICABLE`. Separately, the evidence status is `EVIDENCE_SUFFICIENT`, `EVIDENCE_LIMITED`, or `EVIDENCE_BLOCKED`. Limited evidence names the gaps; blocked evidence names its exact evidence reason and never substitutes for routing or authority dimensions.

## Decision 6: Exactly one bounded curiosity pass

After initial synthesis, the researcher ranks possible follow-up probes by expected decision value, novelty, and cost. It executes at most one highest-value probe that remains within source, time, and network authority. Every rejected material thread is recorded as `CURIOSITY_NO_GO` with a concise reason; the canonical receipt permits at most three entries. If no probe qualifies, the output explicitly states `CURIOSITY_NO_GO` and stops. No autonomous second pass, second researcher, or broadened question is allowed.

## Decision 7: Compressed result and parent reconciliation

The researcher returns a target-350-word compressed body, excluding exact excerpts and the canonical receipt, containing:

- decision verdicts and evidence status;
- a compact claim ledger with claim type, evidence origin, confidence, and citation anchors;
- contradictions and negative results;
- gaps, limits, and saturation statement;
- the curiosity probe or `CURIOSITY_NO_GO`; and
- a `CURIOSITY_RECEIPT` with the canonical ten ordered fields.

Main reconciles only whether the result answers the original decision frame, respects budgets/authority, maps contradictions and gaps, and supports its stated decision impact. Main does not browse, repeat searches, add uncited claims, or expand the specialist analysis. A malformed or weak receipt triggers one bounded repair on the same child ID. A second inadequacy blocks rather than causing replacement or emulation.

## Decision 8: Three independent status dimensions

The final response reports all three dimensions:

- `routing: ROUTED|BLOCKED_ROUTING`, with `TASK_UNAVAILABLE|SKILL_UNAVAILABLE` when blocked;
- `authority: READ_ONLY_AUTHORIZED|BLOCKED_AUTHORITY`, with `NETWORK_UNAUTHORIZED|WRITE_REQUESTED` when blocked; and
- `evidence: EVIDENCE_SUFFICIENT|EVIDENCE_LIMITED|EVIDENCE_BLOCKED`.

A successful route does not imply network authority, and network authority does not imply sufficient evidence. Evidence status never overrides a routing or authority block. Material decision-affecting unknowns remain `UNRESOLVED` and require the applicable canonical `BLOCKED_EVIDENCE` or `USER_DECISION_REQUIRED` terminal status with an exact reason.

## Data flow

`manual question → bounded frame/budgets/authority → exactly one researcher Task + required skill → initial evidence synthesis → zero-or-one curiosity probe → compressed ledger + receipt → parent reconciliation → three-dimensional status`

There is no write or implementation branch.

## Cursor semantic limitations

- Task dispatch and named-skill use are prompt contracts, not guaranteed attachment or scheduling.
- Agent `readonly` metadata and prose do not prove capability confinement; children inherit the parent tool/mode envelope.
- Network availability and authorization depend on host/user policy and must be observed, not inferred.
- The preferred researcher model may fall back under Cursor plan or policy; backend identity is not guaranteed.
- Static tests can prove authored text and inventory only, not live discovery, dispatch, permissions, network behavior, model selection, or compliance.

## Migration

The command already exists, so rollout aligns its authored contract and tests in place. There is no alias, inventory-count change, state/data migration, package installation, or OpenSpec runtime. An isolated live smoke may later test routing, blocked network behavior, no-write semantics, and output structure; absence of that smoke is reported as missing evidence.

## Binary design checks

- Exactly one named researcher and required skill are present in the route.
- No implementer, alternate specialist, nested delegation, or main emulation path exists.
- Source and time budgets plus a canonical stopping rule are mandatory before dispatch.
- External access cannot occur without explicit authority.
- Every material claim is typed, origin-labeled, confidence-labeled, scoped, and cited.
- Contradictions and negative results cannot be silently dropped.
- At most one authorized curiosity probe executes; rejected threads use `CURIOSITY_NO_GO`.
- Parent reconciliation cannot become a new research pass.
- Routing, authority, and evidence statuses remain independent.
- No OpenSpec CLI, runtime, state, dependency, or write is introduced.

## Integrated authority note (2026-08-17)

ADR 0033 and the canonical rule supersede any package-local assumption that a writable route may skip specification, treat persistence as optional, use a different writer for persistence, or treat Plan/Todo/tasks as authority. Read-only invocation remains proportional; if it transitions to mutation, automatic specification, exact approval, immutable persistence, same-Task linkage, and all declared required checks apply. This package remains an OpenSpec-compatible planning and history input, not formal OpenSpec adoption.
