---
description: Independently review supplied change evidence without applying fixes.
---

# Review

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
      "intent": "INDEPENDENT_REVIEW",
      "tasks": [
        {
          "agent": "curiosity-reviewer",
          "skills": [
            "curiosity-independent-review"
          ],
          "mode": "read-only"
        }
      ],
      "writerCount": 0,
      "ownerGate": "NONE",
      "review": "FRESH_REVIEWER",
      "evidence": [
        "criteria map",
        "evidence origins",
        "verdict"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "BLOCKED_EVIDENCE",
        "DONE"
      ]
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

This semantic routing prompt is not host-enforced. Main does not emulate or perform the reviewer role. Use the canonical authority rule, Curiosity Gate, compact receipt, evidence capsules, model caveats, parent no-edit/no-mutating-shell boundary, and bounded reconciliation. If the required agent, skill, or Task cannot run, return `BLOCKED_ROUTING`.

No writes and no fixes are permitted. Require binary criteria plus a diff or changed paths and raw verification evidence; after routing succeeds, absent mandatory scope or evidence returns `BLOCKED_EVIDENCE`. Dispatch exactly one fresh `curiosity-reviewer` Task requiring `curiosity-independent-review`.

Require its dual pass across criteria/correctness and maintainability/test/boundary concerns, with typed evidence origins. Trigger security analysis only when an attack surface exists. Return findings first, then `PASS|PASS_WITH_NOTES|CHANGES_REQUIRED|BLOCKED_EVIDENCE`; the canonical evidence gate forbids passing on raw failure, missing evidence, material unknowns, or `UNVERIFIED_SUMMARY`.
