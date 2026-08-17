# Change: Add `/curiosity-spec` and automatic spec-phase authority

## Why

Curiosity has routes for delivery, architecture, research, review, security, and verification, but no manual route that turns an owner request into an owner-approved, executable specification before implementation. Users currently have to infer how architecture advice, binary acceptance, implementation tasks, and immutable file persistence fit together. That invites implied decisions, main-agent writes, and Todo state being mistaken for specification evidence.

## What changes

- Expose `/curiosity-spec` for direct drafting and make the same spec phase automatic before every writable route.
- Route specification decision design to exactly one `curiosity-strategist` Task requiring `curiosity-decision-design`.
- Produce an executable specification in the conversation: bounded scope, non-goals, dependencies, assumptions, ADDED/MODIFIED requirements, Given/When/Then scenarios, ordered tasks, risks, migration, and binary acceptance checks.
- Require explicit owner approval; a draft, silence, or Todo completion is not approval.
- Keep generation read-only. Main may orchestrate, synthesize, and update native Plan/Todo, but may not write files or use mutating shell commands.
- For every writable route, make exact approval and immutable persistence automatic before mutation. The same sole `curiosity-implementer` Task persists and then performs the approved bounded mutation; main and the strategist never write. Direct standalone drafting remains read-only, and standalone persistence may stop after persistence when no calling mutation route exists. A fresh read-only reviewer audits the result under the existing evidence gate.
- Fail closed with distinct Task, agent, skill, owner-question, and persistence reasons. Approval remains recorded in conversation, but `APPROVED_NOT_PERSISTED` never authorizes mutation.
- Preserve the Cursor-only, file-only product boundary: no OpenSpec CLI, runtime, hook, MCP, SDK, installer, daemon, state store, executable asset, dependency, or compatibility alias.

## Capabilities

### New capability

- `curiosity-spec-command`: directly invocable and automatically integrated, owner-gated production plus mandatory pre-write persistence of an executable specification.

### Modified capability

- Installed command inventory changes to twelve prefixed commands while all four agents, five skills, and one rule remain unchanged.

## Dependencies

- Existing `curiosity-strategist` and `curiosity-decision-design` for required decision design.
- Existing `curiosity-implementer`, `curiosity-implementation-discipline`, and `curiosity-architecture-awareness` for automatic writable-route persistence/mutation or owner-requested standalone persistence.
- Existing `curiosity-reviewer` and `curiosity-independent-review` to audit persisted files before persistence is reported complete.
- Existing always-applied `curiosity-delivery` authority, Curiosity Gate, receipt, and evidence rules.
- Cursor's native Task and Plan/Todo capabilities. These are host capabilities, not package or runtime dependencies.

No new package, target-project dependency, CLI, or network service is required.

## Non-goals

- Mutating target behavior during read-only drafting or before exact approval and persistence.
- Inferring approval from a request, silence, or Todo state.
- Replacing `/curiosity-architecture` or granting architecture authority to main or the implementer.
- Adding an OpenSpec runtime, CLI wrapper, schema validator, state machine, or generated cache.
- Treating Plan/Todo state, a strategist recommendation, or file existence as approval or completion evidence.
- Guaranteeing host enforcement of prompt-governed routing, permissions, skill availability, or model selection.

## Migration and rollout

This is additive and backward compatible. Existing command names and behavior remain unchanged. The implementation updates manifest and inventory documentation to twelve commands and adds the regular, non-executable Markdown command asset. After loading the updated plugin, the owner reopens an isolated Cursor session and checks discovery of `/curiosity-spec`. There is no data, state, alias, CLI, or target-project migration.

## Risks

- **Prompt-only enforcement:** Cursor may not enforce Task or parent/child write boundaries. Mitigation: explicit fail-closed statuses, path audit, and no claims of capability enforcement.
- **Approval ambiguity:** conversational assent may be misread. Mitigation: require an explicit `APPROVE`, `REVISE`, or `REJECT` response tied to the displayed draft identity.
- **Draft/persisted drift:** an implementer could alter approved content. Mitigation: pass exact approved content and paths, require verbatim persistence evidence, then independent review.
- **Todo inflation:** projected tasks may appear authoritative. Mitigation: label Plan/Todo as an ephemeral projection; the approved specification and evidence map control status.
- **Specification overreach:** a spec could quietly select consequential architecture. Mitigation: strategist decision design and the owner-decision sweep precede approval.

## Binary acceptance

1. PASS only if the command supports direct manual drafting and the same phase runs automatically for writable routes, with decision design routed to exactly one named strategist Task with its required skill.
2. PASS only if its output contract contains executable ADDED/MODIFIED requirements, Given/When/Then scenarios, tasks, dependencies, non-goals, migration, risks, and binary checks.
3. PASS only if exact owner approval gates the approved state and every writable route automatically persists that approved package before mutation.
4. PASS only if main and all read-only specialists are forbidden from file and mutating-shell writes, with the same sole implementer Task performing persistence and the calling route's bounded mutation.
5. PASS only if Task and skill unavailability have distinct stable reason codes and fail closed without specialist emulation.
6. PASS only if native Plan/Todo is described as a projection, never approval or evidence.
7. PASS only if the installed surface remains regular file-only Markdown/MDC with no CLI, runtime, executable, dependency, or state store.
8. PASS only if migration updates the documented command count to twelve without aliases or changes to existing command names.

## Impact

Expected implementation touch points are the new command Markdown, plugin manifest, static command/inventory tests, README and architecture/spec documentation, migration notes, changelog, and provenance manifests required by repository convention. This proposal itself authorizes none of those implementation edits.

## Integrated authority note (2026-08-17)

ADR 0033 and the canonical rule supersede any package-local assumption that a writable route may skip specification, treat persistence as optional, use a different writer for persistence, or treat Plan/Todo/tasks as authority. Read-only invocation remains proportional; if it transitions to mutation, automatic specification, exact approval, immutable persistence, same-Task linkage, and all declared required checks apply. This package remains an OpenSpec-compatible planning and history input, not formal OpenSpec adoption.
