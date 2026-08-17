---
description: Diagnose and repair one reproducible bug with independent review.
---

# Bug

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
      "intent": "REPAIR",
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
        "reproduced RED",
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

This is a semantic routing prompt, not host-enforced scheduling. Main must not emulate specialists or perform their work. Apply the canonical authority rule and Curiosity Gate, including compact receipts, evidence capsules, model caveats, parent no-edit/no-mutating-shell authority, one writer, same-ID correction, and bounded two-cycle review. If any named agent, required skill, or Task dispatch is unavailable, return `BLOCKED_ROUTING` and name it.

1. Clarify the observed symptom, expected behavior, environment, and binary criteria. Use built-in Explore for localization.
2. Dispatch exactly one curiosity-implementer Task requiring both `curiosity-implementation-discipline` and `curiosity-architecture-awareness`. Require a reproducible intended RED before any behavior edit, an Architecture Boundary Card, a competing hypothesis and discriminating probe, the smallest root-cause patch, and no blind retry.
3. After `DONE`, dispatch a fresh `curiosity-reviewer` Task requiring `curiosity-independent-review`. Require raw RED/GREEN/VERIFY origins and dual-pass review. Corrections resume the same implementer ID and then the same reviewer ID.
4. Return a final criterion/evidence map with `PASS|FAIL|MISSING`, changed paths, raw anchors, verdict, unrun checks, and uncertainty. No evidence or unresolved material unknown means no pass.

A repair automatically freezes and persists its diagnosis-backed acceptance contract first.
