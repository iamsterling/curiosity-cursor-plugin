# Cursor-native engineering workflow specification

**Status:** Normative first complete translation, accepted implementation scope, 2026-08-15.
**Interface:** `/curiosity-engineering <explore|propose|apply|update|status|verify|finish>`.

This is an original, prompt-level Cursor workflow informed by reviewed OpenSpec and Beads concepts. It is **custom and not compatible with OpenSpec or Beads**. It creates no OpenSpec/Beads files, commands, IDs, data models, storage, graph, scheduler, service, daemon, MCP server, claims, leases, sync, federation, archive, or lifecycle authority.

## Binary outcome and authority

The translation succeeds only when the checked-in skill and agents statically direct Cursor's native Plan Mode, Agent Todos, Task/subagents, AskQuestion, sessions, tests/evidence, and user confirmation according to this specification. The user owns intent, acceptance, and completion confirmation. The parent Agent owns coordination, reconciliation, edits not delegated, verification, and truthful reporting. Native Todos communicate work; they do not become a plugin database. No prompt, agent, or inert hook may self-complete the change.

Static tests can establish prompt and metadata guarantees only. A separate bounded smoke can expose defects but cannot establish general discovery, prompt compliance, Plan/Todo UX, Task availability, delegation, session restoration, or model behavior across versions and policies; untested paths remain live-unverified.

## Source behavior inventory and disposition

The durable translation matrix is normative. “Source” means concepts studied, not runtime dependencies or compatibility.

| Source behavior/concept | Disposition | Cursor-native translation or reason |
| --- | --- | --- |
| OpenSpec explicit proposal and behavioral delta | ADAPT | Native Plan Mode change contract with ADD/CHANGE/REMOVE delta and explicit user acceptance. |
| OpenSpec requirements and scenarios | ADOPT | Observable requirements plus happy, error, and edge scenarios in full contracts. |
| OpenSpec validation and archive/completion review | ADAPT | `verify` across completeness/correctness/coherence; `finish` requires fresh evidence and user confirmation. No archive. |
| OpenSpec on-disk specs, CLI, schemas, change IDs, compatibility | REJECT | Plugin remains Cursor-native and stateless. |
| Beads issue hierarchy, dependencies, ready/blocked work | ADAPT | Native Agent Todo hierarchy with dependency, blocked reason, unblock condition, and evidence fields. |
| Beads workers and bounded assignment | ADAPT | Writable Cursor worker/implementer subagents receive exact accepted ready Todos and exclusive ownership. |
| Beads claims/leases, graph engine, scheduler, daemon, sync/federation, storage, IDs | REJECT | Unsupported custom lifecycle/runtime and duplicate state are prohibited. |
| Source implementer test-first/minimal-diff discipline | ADOPT | Implementer requires behavior RED first, focused GREEN, required checks, raw failures, and no test weakening. |
| Source worker narrow mechanical execution | ADOPT | Worker is limited to one mechanical bounded Todo and named checks. |
| Source advisory research/review/strategy routing | ADOPT | Read-only specialists remain optional evidence providers. |
| Automatic stop-hook continuation | REJECT | Hook always returns `{}`; it translates no capability and powers no continuation. |
| Correlated restoration from stable plan/Todo identifiers | DEFER | Current stop fields do not establish correlation; status reconstructs only from Cursor-owned context and asks on ambiguity. |
| Live Cursor/model assurance | DEFER | Requires separate approval, credentials, and smoke scope. |

## Native change contract

Every proposed change contract is stored only in Cursor's native plan/session context and contains these labeled sections:

1. **Identity and intent/problem** — a human-recognizable title and the user problem/outcome, without invented IDs.
2. **Current behavior** — observed facts, with inference and unknowns clearly separated.
3. **Behavioral delta** — explicit **ADD**, **CHANGE**, and **REMOVE** entries; use “none” rather than omitting a category.
4. **Scope and non-goals** — included boundaries, files/packages where known, and explicit exclusions.
5. **Observable requirements** — binary externally observable acceptance checks.
6. **Scenarios** — happy, error, and edge scenarios, each with precondition/action/observable outcome.
7. **Design constraints and decisions** — architecture/package/security constraints and accepted choices with rationale.
8. **Agent Todo hierarchy** — parent/child deliverables; each Todo states dependencies, readiness, blocked reason, unblock condition, exclusive file ownership when delegated, and required evidence. A Todo is ready only when every dependency is evidenced complete and no blocker remains.
9. **Rollback** — bounded reversal and any irreversible effects.
10. **Unresolved assumptions** — unknowns, owner/question, and whether each blocks acceptance or execution.
11. **Completion criteria** — all requirements/scenarios/Todos evidenced; verification complete; no unaccepted material drift; unresolved/deferred work disclosed; explicit user finish confirmation received.

Evidence is an observable artifact such as a focused failing/passing test output, raw command output, diff/path inspection, schema validation, or review finding. Assertion without returned evidence is not evidence. Mandatory failed or missing evidence keeps the affected Todo and overall change **blocked** or **unverified**, never “all done.” User confirmation cannot waive mandatory evidence. Changing or removing an evidence requirement is material drift and requires `update`, a revised native Plan, and renewed native Plan acceptance.

## Risk profiles and deterministic escalation

### Lite profile

Use only for low-risk, behavior-preserving work such as bounded documentation, typo, formatting, or mechanical metadata changes. Lite still requires all eleven contract headings, but current behavior/delta/scenarios/design/Todos may be concise. It requires at least one happy scenario, binary requirements, named checks, rollback, assumptions, and explicit acceptance.

### Full behavioral contract

Use full detail for any user-visible or API behavior change, bug fix, security/privacy/auth/data handling, persistence, concurrency, migration, dependency/package boundary, architecture, destructive/irreversible operation, externally consumed configuration, uncertain blast radius, or consequential performance/reliability change. Full requires happy, error, and edge scenarios; explicit ADD/CHANGE/REMOVE; dependency/readiness/evidence on every Todo; and verification across all three dimensions.

### Prompt-level escalation algorithm

1. If any full-profile trigger is present, choose **full**.
2. If risk, behavior impact, scope, constraints, or evidence needs are ambiguous, do not guess: use AskQuestion and stop for the user; unresolved ambiguity defaults to full only after the user authorizes proceeding.
3. Lite is allowed only when the agent can state evidence that behavior, security posture, public contract, data, dependencies, and architecture are unchanged.
4. Risk may escalate from lite to full at any action. It may not de-escalate without explicit user agreement recorded in the accepted plan.
5. Missing happy/error/edge scenarios makes a full proposal unready and unacceptable.

## Seven actions

An unknown/missing verb must produce usage and no edits. Cancellation, skip, silence, unavailable interaction, and ambiguous response never imply consent.

### `explore`

Make no edits and create no implementation Todos. Clarify intent, current behavior, boundaries, and unknowns. Label every material statement **fact**, **inference**, or **unknown**. Ask neutral bounded questions with AskQuestion when useful. If AskQuestion is unavailable or nonblocking, disclose that, repeat the question in chat, and stop; do not infer an answer.

### `propose`

Require the user to select Plan Mode; a skill cannot switch modes. Inspect source and architecture boundaries, choose lite/full using the deterministic rules, and create the complete native change contract in the user-selected Plan Mode. Ask rather than invent missing consequential details. Require explicit native plan acceptance. Rejection, cancellation, silence, ambiguity, or unavailable acceptance means no acceptance, no implementation Todos, and no edits.

### `apply`

Apply only the currently accepted plan. Project its Todo hierarchy, dependencies, blockers, unblock conditions, ownership, and evidence into native Agent Todos. Classify readiness before selection; never select or delegate a blocked Todo. Add a failing behavior test before behavior edits; characterize existing untested behavior first. The parent may assign an explicitly identified ready Todo to a bounded worker or implementer Task with a complete handoff. Parallel Tasks require an accepted parallel group, independent dependencies, and exclusive non-overlapping file ownership. The parent retains coordination, reconciliation, verification, and completion authority boundaries.

### `update`

Compare new information against the accepted contract. A change to intent, scope/non-goals, observable behavior or scenarios, design constraints/decisions, or evidence/completion requirements is **material drift**: invalidate acceptance, stop edits, revise the native Plan and its delta and affected Todos/dependencies/evidence, and require renewed native Plan acceptance before resuming. A chat clarification, chat choice, or chat confirmation is not reacceptance. If native Plan Mode or native Plan acceptance is unavailable, remain blocked. A minor implementation detail may update without reacceptance only when behavior, scope, constraints, and evidence requirements are unchanged; record the detail and rationale. If classification is ambiguous, ask and stop.

### `status`

Identify the intended native plan. Reconstruct status only from Cursor-owned plan, Agent Todos, current/resumed session context, and returned Task context—never transcript parsing or plugin state. Classify each item **complete**, **active**, **ready**, **blocked**, or **unverified**; include dependencies, blocker/unblock condition, evidence/raw failures, delegation result, and drift/acceptance state. “Complete” requires passing evidence; mandatory failed or missing evidence keeps the affected Todo and overall change blocked or unverified, never all done. Ambiguous plan identity or missing correlation must be reported and asked about, never inferred.

### `verify`

Preserve raw failures and never weaken tests. Verify:

- **Completeness:** every requirement, happy/error/edge scenario, and Todo maps to present evidence; no failed or missing evidence is marked complete.
- **Correctness:** focused behavior, error paths, edge cases, regression/characterization, and repository-required type/lint/build/schema/security checks behave as specified.
- **Coherence:** implementation and evidence match the accepted design and delta, or a material update was reaccepted; no contradictory docs, ownership overlap, hidden scope expansion, or unsupported completion claim remains.

Report static/prompt evidence separately from live-unverified Cursor behavior. Delegated work without returned evidence is unverified, not complete.

### `finish`

Always run `verify` first. Summarize identity/intent, accepted delta, diff/changed paths, tests and raw failures, mapped evidence, unresolved assumptions, deferred work, delegation gaps, and rollback. `finish` must not solicit or accept completion confirmation until all mandatory evidence passes. Mandatory failed or missing evidence remains blocked or unverified, and user confirmation cannot waive it. Only after all mandatory evidence passes, use Cursor's native question interaction to ask the user for explicit completion confirmation. If unavailable/nonblocking, ask in chat and stop. The skill, parent, coordinator, children, and hook never self-confirm or self-complete; without an explicit user “confirm completion” response, work remains unfinished.

## Collaboration and handoff contract

Advisors are read-only. Writable `curiosity-worker` and `curiosity-implementer` are used only for explicitly assigned, accepted, ready Todos. A child prompt must include exact Todo and parent plan context, binary acceptance checks, dependencies and evidence proving readiness, exclusive owned files, prohibited paths/non-goals, required evidence/checks, test-first requirement when behavioral, expected return format, and stop/escalation conditions. Children do not coordinate other agents, expand scope, claim parent/plan completion, or work around blockers.

A reviewer handoff is narrower: every reviewer Task prompt must repeat that `curiosity-reviewer` receives only the accepted native plan/change contract, explicitly bounded current source, the diff, explicit test/evidence outputs, and bounded task context. Transcript parsing or read access and session state access are prohibited. The reviewer must ask the parent for missing context rather than retrieve transcript or session state. These are prompt-level boundaries, not claims of host enforcement.

Worker handles one narrow mechanical bounded change. Implementer handles a normal scoped implementation. The coordinator may route them only if Task and the named agent are available and only within an authorized parallel group. No two concurrent children may own overlapping files or dependent Todos. Failed/unavailable delegation is reported honestly; the parent does not claim work occurred. Returned diffs and evidence are reconciled against the accepted plan before Todo completion.

## Restoration, continuation, and stop hook

There is no automatic continuation. A later `status`, `apply`, `verify`, or `finish` must identify the intended Cursor-native plan from native context; ambiguity stops for user clarification. Cursor stop inputs commonly include `conversation_id`, `generation_id`, `workspace_roots`, and `transcript_path` in addition to status/loop fields, but those fields do not establish accepted-plan or Todo correlation. Transcript parsing is prohibited.

The sole stop hook is inert and returns exactly `{}` for every input, with zero follow-up messages and no side effects. `loop_limit: 5` is a finite host bound, not delivered iteration. The hook does not count as a translated workflow capability and must never be described as powering restoration, continuation, verification, or completion.

## Acceptance checks

- Pinned official Cursor schema accepts one skill, one inert hook, and exactly six explicit agents; all agent frontmatter uses documented `model: inherit` and boolean `readonly`, with writable agents set false.
- Static semantic tests cover every action, all eleven contract sections, profiles/escalation, dependencies/readiness, drift/reacceptance, restoration, verification dimensions, collaboration handoff, and finish confirmation.
- A pure test-only projection validator accepts valid lite/full fixtures and rejects: missing scenarios in full; blocked Todo selection; material drift without revised native Plan acceptance, including chat-only confirmation; mandatory failed/missing evidence completion even with user confirmation; ambiguous status inferred; finish without user confirmation; overlapping parallel ownership; delegation without returned evidence; and reviewer handoffs missing bounded artifacts or permitting transcript/session access.
- Fixture validation proves documented contract shape/invariants only. Tests label prompt/static guarantees separately from live behavior, create no runtime authority, and perform no model execution.
- No-shadow-runtime scans remain green; no prohibited Beads/OpenSpec/runtime assets exist.
- Hook subprocess tests remain inert and docs do not count the hook as behavior.
- Provenance maps the two writable agents to reviewed worker/implementer JSON and records adaptations.
- Package, plugin manifest, and capture producer versions are `0.3.1`.
- Genuine focused RED is captured after tests and before prompt/manifest behavior assets; focused GREEN and `bun run verify` pass before handoff.

## Rollout, rollback, unresolved assumptions, and completion

Rollout is source-only commit and push to the private repository. No install, publication, global config, credential, cloud agent, MCP, or live model smoke is authorized in this change. Rollback reverts the 0.3.1 guidance hardening and restores the prior manifest; ordinary Cursor account, trust, and session state are outside plugin rollback.

Unresolved assumptions are that the operator's Cursor version supports documented writable subagents, Agent Todos, Task, AskQuestion, Plan Mode review, and session restoration as currently described. Static schema/frontmatter validation does not prove runtime enforcement or model compliance. Any contradiction in pinned official documentation is a stop condition rather than permission to invent behavior.

Implementation is complete only when every acceptance check has evidence, no material drift lacks reacceptance, all unresolved/deferred work is disclosed, focused and full verification are green, changes are committed/pushed with clean synchronized status, and the user explicitly confirms `finish` after seeing the evidence.

## Primary research inputs

- Cursor official Plugin reference, Agent Skills, Plan Mode, Hooks, Subagents, CLI usage/parameters, and the pinned schema in `provenance/cursor/`.
- `gastownhall/beads` v1.1.0 at commit `8e4e59d39f3459a43cf21a3236a13eca4dd874f7`, studied only for task/dependency/readiness/collaboration semantics.
- `Fission-AI/OpenSpec` v1.8.0 at commit `d57889664cab4f2f061d236ec3ff82a5578701bb`, studied only for proposal/delta/requirements/scenarios/verification discipline.
- Exact reviewed files, immutable official URLs, retrieval date, and SHA-256 digests: [`../../provenance/cursor/native-change-contract-sources.json`](../../provenance/cursor/native-change-contract-sources.json).
- Reviewed local source prompts `assets/config/agents/worker.json` and `implementer.json`.
