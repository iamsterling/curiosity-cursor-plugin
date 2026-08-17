# Design: Manual executable-specification route

## Context

The bundle is a Cursor-only set of Markdown/MDC prompts. Main orchestrates and synthesizes but never mutates project or temporary paths; broad repository discovery belongs to Explore; the strategist alone designs consequential decisions; and the implementer is the sole bounded writer. Skill requirements and Task routing are semantic contracts because the checked-in files cannot enforce host behavior.

`/curiosity-spec` must therefore support a read-only standalone draft displayed in the conversation. Once a calling route is writable, exact approval and immutable persistence are mandatory before mutation.

## Goals

- Convert supplied writable intent into a decision-complete, owner-approved specification automatically; retain direct `/curiosity-spec` use.
- Make every requirement testable through binary checks and Given/When/Then scenarios.
- Preserve strategist architecture authority and explicit owner selection.
- Keep main read-only while the same sole implementer Task owns approved persistence and any calling route's bounded mutation.
- Use native Plan/Todo for a concise progress projection without creating another state store.
- Provide stable, fail-closed status and reason reporting.

## Non-goals

- Mutate target behavior during drafting or before exact approval and persistence; no OpenSpec CLI or new runtime is introduced.
- Infer approval from conversational continuation.
- Add agents, skills, hooks, dependencies, aliases, executable files, or durable workflow state.
- Replace repository instructions, existing delivery routes, or the canonical evidence gate.

## Decision 1: One required strategist pass owns decision design

After bounded read-only localization, main dispatches exactly one `curiosity-strategist` Task requiring `curiosity-decision-design`. The handoff contains the goal/question, in/out of scope, repository-relative pointers, constraints, dependencies, known facts, owner sweep, binary output criteria, evidence needs, and stop conditions. Optional `curiosity-researcher` routing remains permitted only when external or version-sensitive evidence could change the decision and follows the existing research skill contract.

The strategist supplies the decision frame, credible options, recommendation, assumptions, quality scenarios, trade-offs, reversibility, falsifier, migration implications, ADR disposition, explicit owner decisions, and evidence anchors. Main may normalize and synthesize this into the output schema but may not invent a consequential choice or emulate a missing strategist.

## Decision 2: The conversation artifact is executable

Main renders one identified `DRAFT_SPEC` with these sections:

1. title and draft identity;
2. intent and decision frame;
3. in scope and non-goals;
4. dependencies and constraints;
5. approved or pending decisions, assumptions, and material unknowns;
6. OpenSpec-style `ADDED Requirements` and, where existing behavior changes, `MODIFIED Requirements`;
7. at least one Given/When/Then scenario for every requirement;
8. ordered implementation and verification tasks with dependencies;
9. migration/rollback and risks;
10. binary acceptance map with `PASS|FAIL|MISSING` evidence slots;
11. persistence disposition and current status.

“Executable” means an implementer and reviewer can act on the specification without choosing architecture or inventing acceptance behavior. It does not mean executable code, generated tests, a CLI, or automatic implementation.

## Decision 3: Approval is explicit and revision is bounded

Main asks the owner to respond with exactly one disposition tied to the displayed draft identity:

- `APPROVE <change-id>@rNNNN SHA256:<digest>`: freezes the exact revision and digest as approved but not yet persisted.
- `REVISE <draft-id>: <changes>`: returns to strategist decision design when changes affect a consequential choice; clerical changes may be synthesized by main.
- `REJECT <draft-id>`: ends with `SPEC_REJECTED`.

Silence, Todo completion, an earlier architecture recommendation, or a request to “continue” is not approval. Unresolved consequential choices return `USER_DECISION_REQUIRED`; no approved status is emitted.

## Decision 4: Persistence is exact, automatic before writes, and implementer-only

For every writable route, exact approval authorizes the standard repository-relative immutable package root and persistence follows automatically before target mutation; no path is guessed. A direct standalone `/curiosity-spec` invocation may stop at `APPROVED_NOT_PERSISTED` as a read-only conversation artifact. If standalone persistence is requested without a calling mutation route, the persistence Task may stop after persistence.

For approved persistence, main dispatches exactly one `curiosity-implementer` Task requiring `curiosity-implementation-discipline` and `curiosity-architecture-awareness` in `SPEC_PERSIST_AND_MUTATE` mode. The Task first creates the immutable approved package and verifies its aggregate receipt. When invoked by a writable route, that same Task may then perform only the approved bounded mutation. Persistence itself does not require intended RED; behavior mutation still requires intended RED, applicable checks, initial/final changed-path evidence, and an allowed-path audit.

A fresh `curiosity-reviewer` Task requiring `curiosity-independent-review` audits content identity, approved paths, boundaries, and required structure. Only the canonical passing-verdict gate permits `SPEC_PERSISTED`. If review cannot run, the honest state is `SPEC_PERSISTED_PENDING_REVIEW`, not complete.

Main, strategist, researcher, and reviewer never write. Main also never uses mutating shell commands against project/workspace or temporary paths. The no-write boundary remains prompt-governed, not host-enforced.

## Decision 5: Stable status model

Terminal or waiting states are:

- `DRAFT_SPEC`
- `USER_DECISION_REQUIRED`
- `SPEC_APPROVED`
- `SPEC_REJECTED`
- `APPROVED_NOT_PERSISTED` (non-writable)
- `SPEC_PERSISTED_PENDING_REVIEW`
- `SPEC_PERSISTED`
- `BLOCKED_ROUTING`

`BLOCKED_ROUTING` includes exactly one routing reason:

- `TASK_UNAVAILABLE`: a required Task cannot be dispatched.
- `AGENT_UNAVAILABLE`: the named specialist agent is unavailable.
- `SKILL_UNAVAILABLE`: the named specialist reports its required semantic skill unavailable.

If strategist Task/skill routing is unavailable, specification generation blocks and main does not substitute. If the sole implementer route is unavailable after approval, the conversation artifact remains `APPROVED_NOT_PERSISTED` and cannot authorize any mutation; terminal status is `BLOCKED_ROUTING` with an exact Task/agent/skill reason. Reviewer unavailability may retain `SPEC_PERSISTED_PENDING_REVIEW`, but no completion is claimed. Existing authority, owner, and evidence statuses remain distinct.

## Decision 6: Native Plan/Todo is a lossy projection

Main may project phase and task state into Cursor's native Plan/Todo using plain, host-supported semantics rather than an undocumented schema. Suggested phases are localize, design, owner approval, mandatory pre-write persistence, execution when requested, and review. Each item points back to the current revision and requirement/criterion label.

The projection is disposable and non-authoritative. It does not contain the full specification, does not grant approval, does not survive as plugin state, and cannot establish acceptance PASS. If Plan/Todo is unavailable, main continues with an inline checklist and reports that projection as unavailable; it does not add a fallback state file.

## Decision 7: File-only integration

Implementation adds one regular non-executable command Markdown file and references it from the integrated Cursor plugin manifest. Static tests and documentation record the final inventory of four agents, five skills, twelve commands, and one rule. No OpenSpec CLI command is invoked by `/curiosity-spec`; OpenSpec compatibility comes from authored directory/file conventions and requirement/scenario syntax.

## Data flow

`writable intent or direct /curiosity-spec → read-only localization → strategist synthesis → INTENT_ACCEPTANCE_CONTRACT → exact owner disposition → APPROVED_NOT_PERSISTED → same-Task immutable persistence → SPEC_PERSISTED → bounded mutation when requested → independent review`

At every arrow, main applies the canonical Curiosity Gate before advancing. Raw evidence and the approved artifact outrank Todo projection.

## Risks and trade-offs

- Requiring the strategist for every specification adds latency but prevents main from acquiring decision authority.
- Verbatim persistence limits opportunistic cleanup but prevents approval drift.
- Exact approval adds a user gate while automatic pre-write persistence prevents an approved writable route from acting on conversation-only state.
- A reviewer adds cost for persistence but preserves the repository's evidence invariant.
- Stable statuses improve automation readability, although the host still cannot enforce adherence.

## Migration

The command is additive. Existing users keep all prior commands. The installed command count and discovery instructions move to twelve. No prior specification files are rewritten, no compatibility alias is introduced, and no state or data migration occurs. Reopen an isolated Cursor session after updating the plugin and verify actual command discovery rather than inferring it from the manifest.

## Binary design checks

- The flow cannot reach `SPEC_APPROVED` without a matching explicit owner response.
- The required strategist or skill cannot be replaced by main.
- No path can reach a file write except the exactly approved same-Task implementer route.
- A writable route without exact approved package identity cannot dispatch mutation.
- Each requirement has a Given/When/Then scenario and a binary evidence slot.
- Plan/Todo completion cannot change approval or acceptance status.
- No flow invokes an OpenSpec CLI or creates plugin-owned durable state.

## Integrated authority note (2026-08-17)

ADR 0033 and the canonical rule supersede any package-local assumption that a writable route may skip specification, treat persistence as optional, use a different writer for persistence, or treat Plan/Todo/tasks as authority. Read-only invocation remains proportional; if it transitions to mutation, automatic specification, exact approval, immutable persistence, same-Task linkage, and all declared required checks apply. This package remains an OpenSpec-compatible planning and history input, not formal OpenSpec adoption.
