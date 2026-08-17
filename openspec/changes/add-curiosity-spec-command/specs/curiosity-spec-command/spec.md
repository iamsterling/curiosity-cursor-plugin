# Capability: Curiosity specification command

## ADDED Requirements

### Requirement: Manual specification invocation

The plugin SHALL expose `/curiosity-spec` as a directly invoked semantic command and SHALL automatically invoke the same specification phase before every writable route. The specification phase SHALL NOT itself implement the described change or invoke a CLI; after immutable persistence, the same sole implementer Task MAY perform the separately approved bounded mutation.

#### Scenario: Owner directly requests a specification

- **Given** the command is discoverable in a Cursor session
- **When** the owner invokes `/curiosity-spec` with a bounded intent
- **Then** the command begins the read-only specification route
- **And** no target behavior is implemented or file persisted by default

### Requirement: Strategist-owned decision design

The command SHALL dispatch exactly one `curiosity-strategist` Task requiring `curiosity-decision-design` for specification decision design. Main MAY synthesize the strategist result but SHALL NOT emulate the strategist, select an unresolved consequential option, or grant architecture authority to an implementer.

#### Scenario: Consequential choices are present

- **Given** the requested specification creates, chooses, or crosses a consequential boundary
- **When** decision design begins
- **Then** exactly one strategist Task applies the owner-decision sweep and presents credible options, trade-offs, reversibility, and a recommendation
- **And** unresolved choices are returned as `USER_DECISION_REQUIRED`

### Requirement: Executable specification output

The command SHALL render an identified `DRAFT_SPEC` in the conversation. The draft SHALL include intent and decision frame, scope, non-goals, dependencies, constraints, decisions and assumptions, OpenSpec-style ADDED/MODIFIED requirements, at least one Given/When/Then scenario per requirement, ordered tasks and dependencies, migration/rollback, risks, and binary acceptance checks with evidence slots.

#### Scenario: A decision-complete draft is produced

- **Given** required routing succeeded and consequential unknowns are resolved or explicitly owner-gated
- **When** main synthesizes the strategist result
- **Then** it emits every required executable-specification section
- **And** an implementer can act without inventing architecture or acceptance behavior
- **And** “executable” does not imply code, CLI execution, generated tests, or automatic implementation

### Requirement: Explicit owner approval

The command SHALL require an explicit disposition tied to exact identity and the canonical package `contract_sha256`. Only `APPROVE <change-id>@rNNNN SHA256:<digest>` with that aggregate SHALL produce `APPROVED_NOT_PERSISTED`; `REVISE <change-id>@rNNNN: <changes>` SHALL create corrected content under the same revision until approval; and `REJECT <change-id>@rNNNN` SHALL reject it. Silence, generic continuation, Todo completion, or prior advice SHALL NOT constitute approval.

#### Scenario: Approval is ambiguous

- **Given** a `DRAFT_SPEC` awaits owner disposition
- **When** the owner does not provide a matching explicit disposition
- **Then** the command remains `USER_DECISION_REQUIRED`
- **And** no persistence Task is dispatched

#### Scenario: Owner approves the identified draft

- **Given** a displayed draft has no material unresolved decision
- **When** the owner responds `APPROVE <change-id>@rNNNN SHA256:<digest>` with matching identity and content
- **Then** that exact content is frozen as `SPEC_APPROVED`
- **And** a standalone draft may remain read-only, while a writable calling route proceeds automatically to immutable persistence

### Requirement: No main or read-only-specialist writes

Main SHALL limit itself to read-only orchestration, synthesis, and native Plan/Todo updates. Main SHALL NOT use file edit/write/delete tools or mutating shell commands against project, workspace, or temporary paths. The strategist, researcher, and reviewer SHALL remain read-only. These SHALL be described as semantic boundaries, not host-enforced permissions.

#### Scenario: Owner asks main to save the draft directly

- **Given** an approved specification exists in the conversation
- **When** the owner asks main or a read-only specialist to write it
- **Then** main refuses direct mutation and routes approved persistence to the sole implementer
- **And** it does not claim the host technically prevented a write

### Requirement: Integrated implementer-only persistence

Every writable route SHALL automatically persist the exactly approved frozen content before mutation through exactly one `curiosity-implementer` Task requiring `curiosity-implementation-discipline` and `curiosity-architecture-awareness` in `SPEC_PERSIST_AND_MUTATE` mode. Approval SHALL bind one aggregate named `contract_sha256` using `SHA256_UINT64BE_LENGTH_FRAMED_PATH_AND_FILE_BYTES_V1`: globally sort UTF-8 relative paths bytewise and hash, for each path, uint64be path length plus path bytes and uint64be file length plus file bytes. The immutable included set SHALL be exactly `design.md`, `proposal.md`, and `specs/<slug>/spec.md`; `tasks.md`, `approval.md`, and `evidence.md` SHALL be excluded. `approval.md` SHALL be written last with algorithm, included paths, excluded paths, and digest. Read-back SHALL recompute that one aggregate, and disagreement SHALL return `BLOCKED_EVIDENCE SPEC_DIGEST_MISMATCH`. Tasks and append-only evidence remain non-authoritative and SHALL NOT mutate approval-bound files. The same Task MAY continue into the calling route's approved bounded mutation after read-back succeeds; it SHALL NOT alter approved content or write outside approved paths. A direct standalone draft MAY remain `APPROVED_NOT_PERSISTED`, and standalone persistence may stop after persistence when no calling mutation route exists. Applicable structural verification and an allowed-path audit replace intended RED for persistence alone; any subsequent behavior mutation still requires intended RED.

#### Scenario: Owner chooses conversation-only output

- **Given** the owner approved a direct standalone draft with no calling mutation route
- **When** the owner declines persistence
- **Then** the command returns `APPROVED_NOT_PERSISTED` and permits no mutation
- **And** no writing agent is dispatched

#### Scenario: Owner approves exact-path persistence

- **Given** the owner approved a direct standalone draft and exact repository-relative persistence paths
- **When** persistence begins
- **Then** exactly one implementer receives only the frozen content and approved paths
- **And** final changed-path evidence is audited against those paths

#### Scenario: Persistence path is unspecified

- **Given** an approved direct standalone draft and a general request to save it
- **When** no exact repository-relative path is approved
- **Then** the command requests the missing owner decision
- **And** no implementer is dispatched and no path is guessed

### Requirement: Independent persistence audit

A claimed persisted specification SHALL receive a fresh `curiosity-reviewer` Task requiring `curiosity-independent-review`. The reviewer SHALL audit content identity, approved paths, required structure, and evidence. Only the canonical passing-verdict gate SHALL permit `SPEC_PERSISTED`.

#### Scenario: Persistence exists without completed review

- **Given** the implementer reports files persisted
- **When** independent review is unavailable or has not passed
- **Then** the command reports `SPEC_PERSISTED_PENDING_REVIEW`
- **And** it does not claim persistence completion

### Requirement: Stable unavailable-capability statuses

Required routing failures SHALL return `BLOCKED_ROUTING` with distinct `TASK_UNAVAILABLE`, `AGENT_UNAVAILABLE`, or `SKILL_UNAVAILABLE`. Main SHALL NOT emulate a missing specialist. If mandatory pre-write persistence routing fails after approval, preserve `APPROVED_NOT_PERSISTED`, prohibit mutation, and report the exact reason.

#### Scenario: Required strategist Task is unavailable

- **Given** `/curiosity-spec` needs decision design
- **When** Cursor cannot dispatch the strategist Task
- **Then** the command returns `BLOCKED_ROUTING` with `TASK_UNAVAILABLE`
- **And** main does not produce strategist-equivalent decision design

#### Scenario: Required strategist skill is unavailable

- **Given** the strategist Task starts
- **When** `curiosity-decision-design` is unavailable
- **Then** the specialist blocks with `SKILL_UNAVAILABLE`
- **And** main returns `BLOCKED_ROUTING` with `SKILL_UNAVAILABLE` rather than improvising the method

#### Scenario: Required persistence Task is unavailable

- **Given** a valid `SPEC_APPROVED` and approved persistence paths
- **When** the implementer Task cannot be dispatched
- **Then** the command returns `APPROVED_NOT_PERSISTED` with `TASK_UNAVAILABLE` and no write authority
- **And** the approved conversation artifact remains valid

### Requirement: Native Plan/Todo projection

Main MAY project localization, design, approval, mandatory pre-write persistence, requested execution, and review into native Plan/Todo using documented host semantics. The projection SHALL be lossy, disposable, and non-authoritative. It SHALL NOT grant approval, establish acceptance evidence, contain required durable state, or override the approved specification.

#### Scenario: Todo items are complete but evidence is missing

- **Given** all projected Todo items display complete
- **When** approval or mandatory acceptance evidence is missing
- **Then** the command remains waiting or blocked as applicable
- **And** Todo completion does not establish PASS

#### Scenario: Native Plan/Todo is unavailable

- **Given** the host does not expose native Plan/Todo
- **When** the command runs
- **Then** main uses an inline conversational checklist and reports projection unavailable
- **And** it creates no fallback state file

### Requirement: File-only and no-CLI boundary

The command SHALL be implemented as a regular, non-executable Markdown asset in the Cursor plugin bundle. It SHALL add no OpenSpec CLI invocation, runtime, hook, MCP, SDK, installer, daemon, package dependency, generated cache, executable asset, or plugin-owned state store.

#### Scenario: OpenSpec-compatible files are requested

- **Given** an approved specification uses OpenSpec-compatible paths and syntax
- **When** the owner approves persistence
- **Then** the implementer writes the approved text using existing file tools and repository conventions
- **And** no OpenSpec CLI or additional dependency is installed or executed

## MODIFIED Requirements

### Requirement: Installed command inventory

The installed surface SHALL contain exactly four agents, five composable skills, twelve prefixed commands, and one always-applied rule. The lifecycle command SHALL be `/curiosity-spec`; all existing command names SHALL remain available without compatibility aliases.

#### Scenario: Updated plugin is statically inspected

- **Given** the change is implemented
- **When** repository inventory checks inspect the manifest and command assets
- **Then** they find exactly twelve commands including `commands/curiosity-spec.md`
- **And** they still find four agents, five skills, and one rule
- **And** no alias or executable command asset is present

### Requirement: Command routing fallback

Command routing SHALL continue to be semantic rather than host-enforced. `/curiosity-spec` SHALL preserve the canonical authority, Curiosity Gate, evidence, same-ID correction, and model-fallback caveats while applying the distinct unavailable-capability statuses defined above.

#### Scenario: Static contract passes but live routing is untested

- **Given** static repository checks validate the authored `/curiosity-spec` asset
- **When** no isolated Cursor smoke run has executed
- **Then** documentation reports static contract evidence separately from missing live evidence
- **And** it does not claim actual host discovery, dispatch, permissions, skill attachment, or model selection

### Requirement: Integrated immutable spec-before-write authority

Any branch that mutates source, ledger, package, or archive state SHALL automatically produce a visible `INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN`, obtain exact approval, and have the same sole implementer Task persist the immutable package before bounded mutation. Read-only branches SHALL remain proportional until they transition to mutation. Plan/Todo/tasks SHALL remain non-authoritative.

#### Scenario: A route transitions to mutation

- **Given** a read-only or writable command reaches a requested mutation
- **When** no exact approved and persisted current revision is bound
- **Then** the route runs specification, clarification, approval, and persistence automatically
- **And** no mutation begins from draft, unpersisted, stale, or mismatched content
