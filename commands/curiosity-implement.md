---
description: Implement one approved durable change package with test-first evidence.
---

# Implement

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
      "intent": "APPROVED_CHANGE",
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

This is a bounded semantic routing prompt, not host-enforced scheduling. Main never emulates specialists, writes files, or runs mutating shell. Treat file-only change packages as non-runtime planning inputs, not proof of formal OpenSpec adoption. Apply the canonical authority rule, Curiosity Gate, receipts, evidence capsules, and status precedence, authority, Curiosity, owner, and evidence gates.

If no exact persisted contract exists, or if it is stale, automatically run clarification, approval, and immutable persistence rather than bypassing or merely blocking. Require the exact persisted `spec_ref`, revision, content digest, approval, exact allowed paths, binary acceptance criteria, and resolved consequential decisions. Dispatch exactly one `curiosity-implementer` Task requiring `curiosity-implementation-discipline` and `curiosity-architecture-awareness`; this same Task persists and mutates. Require dirty-work protection, an Architecture Boundary Card, an executed intended RED before behavior edits, the smallest root-cause fix without weakening that test, every declared required full check, and an allowed-path audit. Then dispatch a fresh `curiosity-reviewer` Task requiring `curiosity-independent-review`; corrections resume the same IDs under the bounded cycle policy.

Routing failures return `BLOCKED_ROUTING`; successfully routed work outside granted authority returns `BLOCKED_AUTHORITY`; unresolved consequential choices return `USER_DECISION_REQUIRED`; failed or missing mandatory evidence returns `BLOCKED_EVIDENCE`. Return `DONE` only after every criterion and gate.

Implementation preserves its automatically persisted exact specification binding.
