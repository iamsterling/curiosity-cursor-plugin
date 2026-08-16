# Hierarchical context-preserving Cursor delivery

**Status:** Normative, accepted 2026-08-16.

## Optimization and authority

Context quality and parent-context preservation are the optimization function. The top-level main Cursor Agent is the sole orchestrator and synthesizer. Main keeps only intent, decisions, native Plan/Todo state, concise specialist findings, binary acceptance criteria, returned evidence, agent IDs, and reviewer verdicts. It delegates broad reads/searches to built-in Explore and does not personally accumulate that output.

**REQUIRED SEMANTIC INVARIANT:** main never edits project source or runs project-mutating shell commands. **DESIRED HOST ENFORCEMENT / KNOWN LIMITATION:** Cursor cannot currently deny main edits while allowing a writable child because children inherit the parent mode/tool envelope. This is prompt governance, not capability enforcement. Stay in Agent mode for writable hierarchy. Plan Mode may support an initial human-approved plan before returning to Agent mode; Ask/Plan cannot be expected to elevate a writable child.

## Exact installed surface

The manifest installs exactly four Markdown agents, one file-only Markdown skill, one Markdown command, and one always-applied MDC rule.

| Component | Access | Model preference | Purpose |
| --- | --- | --- | --- |
| `curiosity-strategist` | read-only | `grok-4.6` | Consequential architecture and strategy |
| `curiosity-researcher` | read-only | `grok-4.6` | Bounded primary-source research |
| `curiosity-implementer` | writable | `composer-2.5` | Sole source editor for one bounded task |
| `curiosity-reviewer` | read-only | `claude-sonnet-5` | Independent evidence-based review |

The implementation-discipline skill is applied by the implementer. The delivery command governs main. All custom specialists report directly to main; there is no nested delegation. One writable implementer at a time and no parallel writes.

## Handoff contract

Every specialist handoff contains: GOAL; DECISION/QUESTION; IN SCOPE; OUT OF SCOPE; KNOWN CONTEXT; AUTHORITATIVE INPUTS; CONSTRAINTS; REQUIRED OUTPUT; DONE WHEN; STOP/ESCALATE WHEN. Implementer handoffs additionally specify explicit allowed paths, binary acceptance checks, approved dependency changes (`none` when absent), and verification evidence requirements.

## Delivery flow

1. Main clarifies intent, non-goals, constraints, and binary acceptance criteria; blocking ambiguity ends as `USER_DECISION_REQUIRED`.
2. Main creates concise native Todo state, delegates broad repository exploration to built-in Explore, and retains only concise findings.
3. Main may delegate bounded questions to researcher or strategist. Plan Mode is optional before returning to Agent mode.
4. Main dispatches exactly one bounded implementer and preserves its ID. Before any behavior edit, the implementer adds and executes a focused behavior test that fails for the intended reason; characterization and unrelated failures are not RED evidence. A discriminating probe supplements that test and substitutes only for non-behavior/documentation work or a genuinely infeasible durable test, where repository policy requires stop/escalation or an explicit user-authorized exception. The implementer then makes the smallest patch in allowed paths, runs project-supported verification, and returns `DONE` or `BLOCKED`, changed paths, raw evidence, and residual risk.
5. After a block, main resumes the same implementer ID. Main never implements the change itself.
6. After `DONE`, main launches a fresh independent reviewer and preserves its ID. Review examines criteria, current source/diff, and raw checks.
7. On findings, main resumes the same implementer, obtains correction and reverification, then resumes the same reviewer. Maximum two review cycles; a second blocked verdict ends `BLOCKED`.
8. Main synthesizes only after `VERDICT: PASS` or `VERDICT: PASS_WITH_NOTES` with no required failed/missing criterion. Otherwise it reports `BLOCKED` or `USER_DECISION_REQUIRED`.

Todo completion is progress, not evidence. Raw command output, exit status, source/diff, and reviewer findings control PASS/FAIL/MISSING reporting.

## Bounded-curiosity conformance

Curiosity is foundational rather than an optional research step. AUTHORITY, CURIOSITY, and EVIDENCE apply to every substantive child result, including Explore, while preserving the exact installed surface. `rules/curiosity-delivery.mdc` is the sole canonical definition of substantive/trivial classification, receipt fields and limits, and the Parent Curiosity Gate. Other assets reference that rule rather than copying its schema. Conformance requires same-ID bounded repair/reconciliation, raw-evidence precedence, explicit handling of conflicting claims and material unknowns, no autonomous follow-up, no blind retry, and the two-blocked-review cap. These are semantic prompt requirements, not host-enforced controls; no runtime validator, hook, or state store exists.

## Runtime and dependency boundary

The installed surface contains no scripts, hooks, SDK, MCP, CLI wrapper, service, daemon, custom mode, custom state store, transcript parser, external runtime, installer, or executable asset. The plugin never installs or downloads its own runtime, tooling, SDK, package manager, or dependencies.

The assigned implementer may add a target-project dependency only after explicit user approval of the exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest and lockfile changes. It uses only the project's existing or documented manager/manifests. It must never install globally, guess a manager, substitute `npx`, or use curl-pipe bootstrap. It records command output and status, resulting diff, and verification, and must stop on ambiguity.

## Models and host uncertainty

Model pins are preferences subject to plan/team availability and compatible fallback; actual backend identity is not guaranteed. Static checks establish declarations, exact inventory, regular non-executable files, and guidance contracts. They do not prove plugin discovery, prompt compliance, readonly denial, main no-edit behavior, child resumption, nesting behavior, model fallback, or independent permission enforcement.

## Acceptance checks

1. Pinned schema accepts exactly four agents with strategist/researcher `grok-4.6` read-only, implementer `composer-2.5` writable, and reviewer `claude-sonnet-5` read-only.
2. Implementer is the sole bounded source editor, non-delegating, test-first, evidence-returning, and resumable by ID.
3. Main's no-edit/no-mutating-shell semantic invariant and the role-aware implementer exception are explicit without false host-enforcement claims.
4. Command delegates broad Explore and implementation, preserves IDs, launches a fresh reviewer, resumes that same reviewer after corrections, and caps review at two cycles.
5. Ask/Plan child elevation is not claimed; Agent mode and inherited mode/tool limitations are documented.
6. Every installed asset is regular, non-symlink, non-executable Markdown/MDC; no runtime/bootstrap component exists.
7. Cursor-only identity, version 0.5.0, historical relocation integrity, provenance, and secret checks remain green.
8. Every substantive child result uses the canonical receipt; main gates Todo/phase progress and preserves IDs while bounded role-specific challenges and review-cycle accounting remain conformant.
