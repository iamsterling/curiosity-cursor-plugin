# Capability: Curiosity deep-research command

## ADDED Requirements

### Requirement: Manual bounded decision research

The plugin SHALL expose `/curiosity-deep-research` as a manual semantic route for an external or version-sensitive decision question. The route SHALL NOT become general browsing, repository discovery, implementation, persistence, or autonomous research.

#### Scenario: Owner supplies a bounded decision question

- **Given** the command is discoverable in Cursor
- **When** the owner invokes it with a decision question
- **Then** main prepares a bounded read-only research handoff
- **And** the command does not modify the workspace or begin implementation

### Requirement: Exact command-to-skill routing

Main SHALL dispatch exactly one `curiosity-researcher` Task and SHALL require that researcher to use `curiosity-research-evidence`. No implementer, strategist, reviewer, alternate researcher, built-in Explore Task, nested delegation, or second specialist SHALL be part of this command route.

#### Scenario: Required route is available

- **Given** a bounded external or version-sensitive question
- **When** specialist routing begins
- **Then** exactly one `curiosity-researcher` Task receives the handoff
- **And** the handoff names `curiosity-research-evidence` as required
- **And** no writing or alternate specialist is dispatched

### Requirement: No specialist emulation by main

Main SHALL orchestrate and reconcile only. Main SHALL NOT browse, execute searches, apply the research-evidence method itself, add uncited substantive findings, repeat the child searches, or emulate an unavailable researcher or skill.

#### Scenario: Researcher routing is unavailable

- **Given** the command requires external specialist research
- **When** Cursor cannot dispatch the researcher Task
- **Then** routing is `BLOCKED_ROUTING` with `TASK_UNAVAILABLE`
- **And** main does not produce researcher-equivalent findings

#### Scenario: Required research skill is unavailable

- **Given** the researcher Task starts
- **When** `curiosity-research-evidence` is unavailable
- **Then** the child blocks with `SKILL_UNAVAILABLE`
- **And** main reports `BLOCKED_ROUTING` with `SKILL_UNAVAILABLE` without improvising the method

### Requirement: Read-only authority and no implementer

Main and the researcher SHALL NOT edit, write, delete, persist, or execute mutating shell commands against project, workspace, or temporary paths. The command SHALL NOT dispatch `curiosity-implementer`. These boundaries SHALL be represented as semantic prompt contracts rather than host-enforced guarantees.

#### Scenario: Owner requests saved or implemented findings

- **Given** `/curiosity-deep-research` is active
- **When** the owner asks the command to save, edit, or implement its findings
- **Then** authority is `BLOCKED_AUTHORITY` with `WRITE_REQUESTED` for this route
- **And** neither main nor the researcher writes
- **And** no implementer is dispatched implicitly

### Requirement: Explicit external-network authorization

The route SHALL use external-network tools only when the user request and current host/tool permission envelope explicitly authorize that access. Read-only metadata SHALL NOT count as network authorization. If required external access is absent or denied, the command SHALL fail closed without attempting network use.

#### Scenario: External access is not authorized

- **Given** the question requires external evidence
- **And** explicit network authorization is absent or denied
- **When** the route checks authority
- **Then** authority is `BLOCKED_AUTHORITY` with `NETWORK_UNAUTHORIZED`
- **And** evidence is `EVIDENCE_BLOCKED`
- **And** no external request is attempted

#### Scenario: External access is authorized

- **Given** the owner and host/tool envelope authorize bounded external access
- **When** the researcher executes the handoff
- **Then** network use remains within the declared source and time budgets
- **And** authorization does not imply that evidence is sufficient

### Requirement: Bounded decision frame and budgets

Before dispatch, the handoff SHALL state the decision question and consumer, in-scope and out-of-scope claims, alternatives or threshold where known, decision-changing unknowns, a numeric maximum source budget, a wall-clock or equivalent time budget, applicable version/date/population scope, and a stopping rule of `COVERAGE|SATURATION|EXHAUSTION|BLOCKED`. Missing source or time bounds SHALL block open-ended research.

#### Scenario: Complete bounded frame is supplied

- **Given** the question can be researched within declared limits
- **When** main constructs the handoff
- **Then** every required frame and budget field is explicit
- **And** the researcher can identify when to stop without broadening the question

#### Scenario: A required budget is absent

- **Given** no numeric source maximum or no bounded time limit is supplied
- **When** dispatch would otherwise begin
- **Then** the route requests the missing bound or reports blocked ambiguity
- **And** it does not begin open-ended research

### Requirement: Exact claim taxonomy

Every material claim SHALL have exactly one label: `FACT`, `VENDOR_CLAIM`, `ACADEMIC_FINDING`, `INFERENCE`, or `UNKNOWN`. Labels SHALL describe the nature of the claim rather than its rhetorical strength.

#### Scenario: Mixed evidence is synthesized

- **Given** official documentation, a paper, and researcher reasoning bear on the decision
- **When** the claim ledger is produced
- **Then** each material claim has exactly one taxonomy label
- **And** inferred reasoning is not presented as fact or academic finding

### Requirement: Primary-source hierarchy and triangulation

The researcher SHALL prefer, where applicable, controlling standards and law, first-party specifications and documentation, source code and release artifacts, original datasets, and original peer-reviewed research over independent analysis, secondary summaries, aggregators, and snippets. Lower-tier sources SHALL NOT silently override available higher-tier evidence. Consequential claims SHALL be triangulated or explicitly marked with a single-source limitation.

#### Scenario: Primary and secondary sources disagree

- **Given** an applicable primary source conflicts with a secondary summary
- **When** the researcher evaluates the claim
- **Then** both scoped claims are recorded
- **And** the primary source has priority unless applicability or recency evidence explains otherwise
- **And** the conflict remains visible rather than being resolved by source count

### Requirement: Scoped citations

Every cited material claim SHALL include a stable locator or URL, title and publisher, direct origin, access date, applicable publication or product version/date, and relevant population and scope. Search snippets SHALL be treated only as discovery leads, and excerpts SHALL be distinguishable from paraphrases.

#### Scenario: A version-sensitive vendor claim is cited

- **Given** official product documentation supports a claim
- **When** the claim enters the ledger
- **Then** the citation records the document locator, publisher, access date, and applicable product version and scope
- **And** unsupported extrapolation beyond that scope is labeled `INFERENCE` or `UNKNOWN`

### Requirement: Contradictions and negative results

The output SHALL preserve material contradictions and negative results. Contradictions SHALL map both claims and their source scopes without voting. Negative results SHALL identify the bounded query or method, source class searched, date, extent, and what was not found; they SHALL NOT imply proof of absence unless the method warrants it.

#### Scenario: Credible sources contradict one another

- **Given** two credible sources support incompatible material claims
- **When** synthesis occurs
- **Then** both claims and their applicability are retained
- **And** the decision verdict remains unresolved unless a bounded discriminating probe resolves the conflict

#### Scenario: A search finds no confirming source

- **Given** a bounded authorized search returns no confirming primary evidence
- **When** the result is reported
- **Then** the searched method and limits are recorded as a negative result
- **And** the output does not equate “not found” with “does not exist” without warranted coverage

### Requirement: Evidence origins and confidence labels

Each claim SHALL identify exactly one evidence origin: `RESEARCHER_OBSERVED`, `PARENT_SUPPLIED`, `WORKSPACE_ARTIFACT`, or `UNVERIFIED_SUMMARY`. Each material claim SHALL also have `HIGH`, `MEDIUM`, or `LOW` confidence with a brief basis tied to authority, agreement, recency, and scope fit. `UNVERIFIED_SUMMARY` SHALL NOT establish a supported consequential conclusion.

#### Scenario: Parent supplies an unverified summary

- **Given** main includes a source summary the researcher did not directly inspect
- **When** the summary appears in the ledger
- **Then** its origin is `PARENT_SUPPLIED` or `UNVERIFIED_SUMMARY` as applicable
- **And** it cannot by itself establish a supported consequential verdict

#### Scenario: Direct sources are strong but scope-limited

- **Given** the researcher directly observes authoritative sources outside the target population or version
- **When** confidence is assigned
- **Then** origin is `RESEARCHER_OBSERVED`
- **And** confidence and scope notes expose the applicability limitation

### Requirement: Decision verdicts and evidence status

Each decision question SHALL receive `SUPPORTED`, `FALSIFIED`, `UNRESOLVED`, or `NOT_APPLICABLE`. The final output SHALL separately report evidence as `EVIDENCE_SUFFICIENT`, `EVIDENCE_LIMITED`, or `EVIDENCE_BLOCKED`; limited or blocked status SHALL name gaps or blockers.

#### Scenario: Evidence remains single-source and consequential

- **Given** only one credible source supports a consequential claim
- **And** triangulation could not be completed within budget
- **When** the verdict is produced
- **Then** the single-source limitation is explicit
- **And** the verdict and `EVIDENCE_LIMITED` status do not overclaim certainty

### Requirement: One bounded curiosity pass

After initial synthesis, the researcher SHALL rank candidate probes by decision value, novelty, and cost and SHALL execute at most one highest-value probe within authority and budget. Rejected material threads SHALL be recorded as `CURIOSITY_NO_GO` with reasons, subject to the canonical maximum of three entries. The route SHALL NOT start an autonomous second pass or second researcher.

#### Scenario: One probe could resolve a decision-changing contradiction

- **Given** initial synthesis identifies several possible follow-ups
- **When** one authorized probe has the highest expected decision value within budget
- **Then** the researcher executes only that probe
- **And** material rejected threads are labeled `CURIOSITY_NO_GO`
- **And** no additional curiosity cycle starts

#### Scenario: No follow-up probe qualifies

- **Given** candidate probes exceed authority or budget or cannot change the decision
- **When** the curiosity pass is evaluated
- **Then** the output explicitly records `CURIOSITY_NO_GO` and its reason
- **And** research stops at the applicable canonical stop reason

### Requirement: Compressed result and canonical receipt

The researcher SHALL return a compact body targeting 350 words excluding exact excerpts and the receipt. It SHALL contain verdicts, evidence status, a claim ledger, citation anchors, contradictions, negative results, gaps, limits, saturation, and curiosity-pass disposition. Every substantive result SHALL end with `CURIOSITY_RECEIPT` and the canonical ten ordered fields and values.

#### Scenario: Substantive research completes

- **Given** the researcher reaches coverage, saturation, exhaustion, or block
- **When** it reports to main
- **Then** the compressed body contains every required evidence component
- **And** the final receipt conforms to the canonical field order, bounds, and enum values

### Requirement: Compressed parent reconciliation

Main SHALL reconcile only the result's fit to the original decision frame, budget and authority compliance, contradiction and gap mapping, evidence status, receipt validity, and decision impact. Main SHALL NOT redo searches, browse sources, create new substantive claims, or expand the specialist analysis. One malformed or weak result MAY be repaired by resuming the same child ID once; a second inadequacy SHALL block.

#### Scenario: The first receipt is malformed

- **Given** the substantive body is returned with a malformed or unsupported receipt
- **When** main applies the Parent Curiosity Gate
- **Then** main resumes the same researcher ID for one bounded repair
- **And** it does not replace the child or perform the missing research itself

#### Scenario: The repaired result remains inadequate

- **Given** the same child has used its one bounded repair
- **When** mandatory evidence or receipt defects remain
- **Then** the route blocks with the unresolved evidence exposed
- **And** main does not advance, retry autonomously, or emulate the specialist

### Requirement: Independent routing, authority, and evidence statuses

Every terminal response SHALL report diagnostic dimensions `routing: ROUTED|BLOCKED_ROUTING`, `authority: READ_ONLY_AUTHORIZED|BLOCKED_AUTHORITY`, and `evidence: EVIDENCE_SUFFICIENT|EVIDENCE_LIMITED|EVIDENCE_BLOCKED`. Reasons SHALL be exact: routing `TASK_UNAVAILABLE|AGENT_UNAVAILABLE|SKILL_UNAVAILABLE`; authority `NETWORK_UNAUTHORIZED|SOURCE_OUT_OF_SCOPE`; evidence `BUDGET_MISSING|EVIDENCE_INSUFFICIENT|SOURCE_CONFLICT_UNRESOLVED`. It SHALL also select one canonical terminal status in precedence order: `BLOCKED_ROUTING`, `BLOCKED_AUTHORITY`, `USER_DECISION_REQUIRED`, `BLOCKED_EVIDENCE`, or `DONE`. A successful route SHALL NOT imply network authority or sufficient evidence, and evidence status SHALL NOT override routing or authority blockers; generic terminal `BLOCKED` is forbidden.

#### Scenario: Routing succeeds but evidence is inconclusive

- **Given** the required researcher and skill run with authorized read-only access
- **When** material evidence remains contradictory at the budget limit
- **Then** routing is `ROUTED`
- **And** authority is `READ_ONLY_AUTHORIZED`
- **And** evidence is `EVIDENCE_LIMITED`
- **And** the decision verdict is `UNRESOLVED`

### Requirement: Cursor semantic limitations and evidence separation

The command SHALL state that Task routing, skill use, read-only behavior, network confinement, and model preference are semantic or host-policy-dependent rather than guaranteed by the checked-in files. Static checks SHALL be reported separately from live Cursor evidence and SHALL NOT prove discovery, dispatch, skill attachment, permissions, network behavior, backend identity, or semantic compliance.

#### Scenario: Only static contract checks have run

- **Given** repository tests inspect the authored command and related assets
- **When** no isolated Cursor smoke run is available
- **Then** the result reports static contract evidence
- **And** live discovery, routing, skill use, authority, network, model, and compliance evidence are explicitly missing

## MODIFIED Requirements

### Requirement: Existing command migration

Alignment SHALL preserve the existing `/curiosity-deep-research` name and the installed surface of four agents, five skills, twelve prefixed commands, and one always-applied rule. It SHALL add no alias, OpenSpec CLI invocation, runtime, hook, MCP, SDK, installer, daemon, executable asset, package dependency, generated cache, or plugin-owned state/data migration.

#### Scenario: Aligned plugin inventory is inspected

- **Given** the command contract is later implemented
- **When** static inventory and boundary tests run
- **Then** `/curiosity-deep-research` remains one of exactly twelve prefixed commands
- **And** agent, skill, and rule counts remain unchanged
- **And** no alias, executable, dependency, runtime, or state migration is present

### Requirement: Integrated immutable spec-before-write authority

Any branch that mutates source, ledger, package, or archive state SHALL automatically produce a visible `INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN`, obtain exact approval, and have the same sole implementer Task persist the immutable package before bounded mutation. Read-only branches SHALL remain proportional until they transition to mutation. Plan/Todo/tasks SHALL remain non-authoritative.

#### Scenario: A route transitions to mutation

- **Given** a read-only or writable command reaches a requested mutation
- **When** no exact approved and persisted current revision is bound
- **Then** the route runs specification, clarification, approval, and persistence automatically
- **And** no mutation begins from draft, unpersisted, stale, or mismatched content
