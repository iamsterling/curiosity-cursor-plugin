---
description: Route, implement, verify, and independently review one approved change.
---

# Deliver change

<!-- ROUTE_CONTRACT
{
  "statusPrecedence": [
    "BLOCKED_ROUTING",
    "BLOCKED_AUTHORITY",
    "USER_DECISION_REQUIRED",
    "BLOCKED_EVIDENCE",
    "DONE"
  ],
  "main": {
    "writes": false,
    "mutatingShell": false,
    "emulatesSpecialists": false
  },
  "branches": [
    {
      "intent": "PROBE",
      "tasks": [],
      "writerCount": 0,
      "ownerGate": "NONE",
      "review": "NONE",
      "evidence": [
        "bounded local findings",
        "receipt"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "optionalTasks": [
        {
          "agent": "curiosity-researcher",
          "skills": [
            "curiosity-research-evidence"
          ],
          "mode": "read-only",
          "when": "DECISION_CHANGING_EXTERNAL_FACTS",
          "network": "EXPLICIT_AUTHORIZATION_REQUIRED"
        }
      ]
    },
    {
      "intent": "BOUNDED",
      "tasks": [
        {
          "agent": "curiosity-implementer",
          "skills": [
            "curiosity-implementation-discipline",
            "curiosity-architecture-awareness"
          ],
          "mode": "SPEC_PERSIST_AND_MUTATE",
          "invocationMode": "SPEC_PERSIST_AND_MUTATE"
        },
        {
          "agent": "curiosity-reviewer",
          "skills": [
            "curiosity-independent-review"
          ],
          "mode": "read-only"
        }
      ],
      "writerCount": 1,
      "ownerGate": "REQUIRED",
      "review": "FRESH_REVIEWER_AFTER_WRITE",
      "evidence": [
        "RED when behavioral",
        "GREEN",
        "VERIFY",
        "review verdict"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "USER_DECISION_REQUIRED",
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "specPhase": {
        "automatic": true,
        "contract": "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN",
        "approvalRequired": true,
        "persistenceRequiredBeforeMutation": true,
        "exactSpecRefRequired": true,
        "staleOrMismatch": "BLOCKED_EVIDENCE SPEC_STALE_OR_MISMATCHED",
        "sameTaskId": true
      }
    },
    {
      "intent": "ARCHITECTURAL",
      "tasks": [
        {
          "agent": "curiosity-strategist",
          "skills": [
            "curiosity-decision-design"
          ],
          "mode": "read-only"
        },
        {
          "agent": "curiosity-implementer",
          "skills": [
            "curiosity-implementation-discipline",
            "curiosity-architecture-awareness"
          ],
          "mode": "SPEC_PERSIST_AND_MUTATE",
          "invocationMode": "SPEC_PERSIST_AND_MUTATE"
        },
        {
          "agent": "curiosity-reviewer",
          "skills": [
            "curiosity-independent-review"
          ],
          "mode": "read-only"
        }
      ],
      "writerCount": 1,
      "ownerGate": "REQUIRED",
      "review": "FRESH_REVIEWER_AFTER_WRITE",
      "evidence": [
        "owner decision",
        "RED when behavioral",
        "VERIFY",
        "review verdict"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "USER_DECISION_REQUIRED",
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "optionalTasks": [
        {
          "agent": "curiosity-researcher",
          "skills": [
            "curiosity-research-evidence"
          ],
          "mode": "read-only",
          "when": "DECISION_CHANGING_EXTERNAL_FACTS",
          "network": "EXPLICIT_AUTHORIZATION_REQUIRED"
        }
      ],
      "specPhase": {
        "automatic": true,
        "contract": "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN",
        "approvalRequired": true,
        "persistenceRequiredBeforeMutation": true,
        "exactSpecRefRequired": true,
        "staleOrMismatch": "BLOCKED_EVIDENCE SPEC_STALE_OR_MISMATCHED",
        "sameTaskId": true
      }
    }
  ],
  "specAuthority": {
    "schema": "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN",
    "package": "openspec/changes/<change-id>-rNNNN",
    "approvalCommitMarker": "approval.md",
    "planTodoTasksAuthority": "NON_AUTHORITATIVE_PROJECTION",
    "approvalAggregate": {
      "field": "contract_sha256",
      "algorithm": "SHA256_UINT64BE_LENGTH_FRAMED_PATH_AND_FILE_BYTES_V1",
      "pathOrder": "UTF8_BYTEWISE_ASCENDING",
      "included": [
        "design.md",
        "proposal.md",
        "specs/<slug>/spec.md"
      ],
      "excluded": [
        "tasks.md",
        "approval.md",
        "evidence.md"
      ]
    }
  }
}
-->

This is a semantic routing prompt, not host-enforced scheduling. Main must not emulate a named specialist or perform its work. If a required named agent, skill, or Task dispatch is unavailable, return `BLOCKED_ROUTING` with the missing capability.

Apply the canonical authority rule before you classify or route. Main may use native Plan/Todo and read-only orchestration, but every mutation routes to exactly one implementer. Missing or unavailable Task, named agent, or named skill routing returns `BLOCKED_ROUTING`; only after routing succeeds does a requested mutation or write beyond granted authority return `BLOCKED_AUTHORITY`. Built-in Explore owns broad repository discovery; all custom agents report to main and never delegate.

## Classify and route

Classify work `PROBE|BOUNDED|ARCHITECTURAL`; classification may only escalate and never de-escalate.

- **PROBE:** no persistent behavior change and no mandatory custom specialist. Use minimal Explore and, only when decision-changing external/version-sensitive facts are needed, optionally dispatch a `curiosity-researcher` Task requiring `curiosity-research-evidence`; any network access requires explicit authorization.
- **BOUNDED:** local, reversible work inside an approved boundary. Use conditional planning only when useful, then exactly one `curiosity-implementer` Task requiring `curiosity-implementation-discipline` and `curiosity-architecture-awareness`, followed by a fresh reviewer Task assigned to `curiosity-reviewer` and requiring `curiosity-independent-review`.
- **ARCHITECTURAL:** creates, chooses, or crosses a boundary involving public API/schema, migration, dependency posture, trust, deployment, spend, compatibility, or irreversibility. The mandatory route is Explore → `curiosity-strategist` Task requiring `curiosity-decision-design` → explicit owner decision → the same exact implementer/reviewer route. The researcher/network subroute is optional under the decision-changing condition above, never mandatory. No edit precedes that decision.

Run the owner sweep: public API/config; data/persistence/migration/retention; dependency/license/supply chain; security/privacy/trust; deployment/operations; compatibility/rollout; paid service/spend; reversibility/rollback. Stop with `USER_DECISION_REQUIRED` for an unresolved consequential choice.

## Handoffs and context

A compact Explore or routine-review handoff may omit irrelevant full fields. Every writable or consequential full handoff includes: WORK CLASS; GOAL and decision/question; REQUIRED SKILLS with why; authority granted/withheld; IN SCOPE and OUT OF SCOPE; repository-relative paths/symbols; known context and authoritative inputs; approved architecture decisions; binary acceptance criteria; evidence required; and STOP/ESCALATE conditions. REQUIRED SKILLS is semantic, not a documented programmatic attachment; agents block with `SKILL_UNAVAILABLE` when unavailable. Never claim a hidden attachment or file-pointer API.

Governance seeds, not performance claims: handoff ≤900 words excluding verbatim requirements/path lists; specialist synthesis ≤1200 words excluding exact excerpts/receipt; evidence capsule ≤150 words; receipt ≤180 words; agents target ≤350 words. Main retains decisions, pointers, capsules, agent IDs, and verdicts—not raw search, log, or process history.

## Sequence

1. Clarify intent and binary criteria. Create concise native Todo state; do not rely on undocumented Todo schemas.
2. Explore only as routing requires. Apply the Curiosity Gate from the rule to every substantive child result.
3. Plan conditionally; obvious bounded work needs no ceremony. Obtain owner decisions before architecture work.
4. For any mutation, dispatch the exactly one `curiosity-implementer` Task specified above under the canonical authority rule. Preserve its ID. It must obtain focused intended RED before behavior edits, protect dirty work, return an Architecture Boundary Card, make the smallest patch, audit allowed paths, and supply separate RED/GREEN/VERIFY capsules.
5. After `DONE`, launch the fresh reviewer Task specified above. Preserve its ID. Accurately distinguish independent execution from evidence audit, and accept `PASS|PASS_WITH_NOTES` only through the rule's canonical passing-verdict evidence gate.
6. For `CHANGES_REQUIRED|BLOCKED_EVIDENCE`, resume the same implementer ID, then the same reviewer ID for scoped re-review. A receipt-only repair does not consume a cycle; a source correction does. Maximum two review cycles; no third cycle.
7. Synthesize criterion `PASS|FAIL|MISSING`, changed paths, decisive evidence, reviewer verdict, unrun checks, and uncertainty. Finalize only after a passing verdict clears that gate; Todo state never overrides evidence.

A missing or weak receipt gets one same-ID repair. Contradictions use raw evidence and one bounded discriminating probe. A material criterion/security/dependency/review unknown blocks. Curiosity stays bounded and starts no autonomous loop.

Dependencies require explicit user approval for exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest/lockfile changes. Never install globally, guess a manager, substitute `npx`, or use curl-pipe bootstrap; stop on ambiguity.

All delivery mutations obey the structured automatic specPhase contract above.
