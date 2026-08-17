## ADDED Requirements

### Requirement: Align the security route
`/curiosity-secure` SHALL separate routine reviewer, strategist, authorized researcher, and approved fix branches.

#### Scenario: Required route
- **Given** a routine threat review is requested
- **When** the command classifies and routes the intent
- **Then** a fresh reviewer runs with no writer
- **And** main performs no specialist work, write, or mutating shell

### Requirement: Canonical terminal status
The route SHALL use the shared non-overlapping terminal status precedence and SHALL report DONE only after mandatory criteria and gates.

#### Scenario: Mandatory evidence fails
- **Given** required routing and authority succeeded
- **When** mandatory evidence is missing or failed
- **Then** the route returns BLOCKED_EVIDENCE rather than BLOCKED_ROUTING or DONE

### Requirement: Integrated immutable spec-before-write authority

Any branch that mutates source, ledger, package, or archive state SHALL automatically produce a visible `INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN`, obtain exact approval, and have the same sole implementer Task persist the immutable package before bounded mutation. Read-only branches SHALL remain proportional until they transition to mutation. Plan/Todo/tasks SHALL remain non-authoritative.

#### Scenario: A route transitions to mutation

- **Given** a read-only or writable command reaches a requested mutation
- **When** no exact approved and persisted current revision is bound
- **Then** the route runs specification, clarification, approval, and persistence automatically
- **And** no mutation begins from draft, unpersisted, stale, or mismatched content
