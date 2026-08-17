---
description: Route an approved feature through classification, implementation, and review.
---

# Feature

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

This semantic routing prompt is not host-enforced. Main never emulates or substitutes for a specialist. Follow the canonical authority rule, Curiosity Gate, receipts, evidence capsules, model caveats, parent no-edit/no-mutating-shell boundary, one writer, same-ID correction, and bounded review cycles. A missing named agent, skill, or Task yields `BLOCKED_ROUTING`.

1. Convert intent into binary criteria; classify `PROBE|BOUNDED|ARCHITECTURAL`, escalating only. Dispatch built-in Explore for repository localization. `PROBE` is a read-only, no-writer branch for bounded local findings; only when decision-changing external/version-sensitive facts are needed may it add the optional researcher route below.
2. For consequential or architectural work, the mandatory route is `curiosity-strategist` with `curiosity-decision-design`, then owner gate, implementer, and reviewer. The optional `curiosity-researcher` Task requires `curiosity-research-evidence` and runs only when external facts could change the decision; network access then requires explicit authorization. Require an explicit owner decision before architectural writes.
3. For an approved mutation, dispatch exactly one curiosity-implementer Task with `curiosity-implementation-discipline` and `curiosity-architecture-awareness`; require intended RED first for behavior changes and separate RED/GREEN/VERIFY evidence.
4. Dispatch a fresh `curiosity-reviewer` with `curiosity-independent-review`, then apply the canonical passing-verdict gate. Resume same IDs for corrections and return the criterion/evidence map.

A feature mutation automatically persists its approved feature contract before editing.
