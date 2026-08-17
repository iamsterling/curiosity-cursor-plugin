---
description: Validate and archive one completed file-only change package.
---

# Close

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
      "intent": "ARCHIVE",
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
        "completion criteria",
        "strict package validation",
        "archive diff",
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
      "intent": "ALREADY_ARCHIVED_IDENTICAL",
      "tasks": [],
      "writerCount": 0,
      "ownerGate": "NONE",
      "review": "NONE",
      "evidence": [
        "exact source absence",
        "identical destination package aggregate",
        "idempotency check"
      ],
      "terminalStatuses": [
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "doneReason": "ALREADY_ARCHIVED_IDENTICAL"
    }
  ],
  "archiveSemantics": {
    "alreadyArchived": "DETECT_BY_EXACT_SOURCE_AND_DESTINATION_STATE",
    "repeatedClose": "IDEMPOTENT_STABLE_RESULT",
    "sourceDestinationConflict": "USER_DECISION_REQUIRED_NO_OVERWRITE",
    "partialMove": "RECOVER_OR_BLOCK_WITH_PATH_EVIDENCE",
    "evidenceGate": "BEFORE_ARCHIVE"
  },
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

This bounded semantic routing prompt is not host-enforced and closes file-only planning artifacts without claiming formal OpenSpec adoption. Main never emulates specialists, writes, or runs mutating shell. Apply canonical status precedence, Curiosity Gate, receipts, evidence capsules, owner gate, and evidence gate.

Before any move, evidence-gate the archive: require a completed package, mapped acceptance evidence, successful repository-supported strict package validation when available, an approved exact archive destination, and no unresolved consequential decision. Inspect the exact source and destination states. If source is absent and the expected destination has the identical package aggregate, select `ALREADY_ARCHIVED_IDENTICAL`: tasks `[]`, writer count zero, no owner gate, and no reviewer. After the exact identity/idempotency evidence passes, return terminal `DONE` with reason `ALREADY_ARCHIVED_IDENTICAL`. If that evidence is missing, return `BLOCKED_EVIDENCE`; do not dispatch a writer. If both source and destination exist, destination differs, or ownership is ambiguous, do not overwrite or merge: return `USER_DECISION_REQUIRED` with source/destination hashes and paths.

Otherwise dispatch exactly one `curiosity-implementer` Task requiring `curiosity-implementation-discipline` and `curiosity-architecture-awareness` for archive persistence only. It moves only approved package paths, records pre/post source and destination evidence plus the archive diff, and performs an allowed-path audit. If a prior or current move is partial, compare exact path/hash inventories: complete only the unambiguous approved remainder, or leave recoverable state untouched and return `BLOCKED_EVIDENCE` with missing/duplicate/conflicting paths. Dispatch a fresh `curiosity-reviewer` Task requiring `curiosity-independent-review` to audit completion evidence, validation, idempotent identity, recovery, and archive boundaries.

Missing Task, named agent, or named skill routing returns `BLOCKED_ROUTING`; an archive action beyond granted paths returns `BLOCKED_AUTHORITY`; an unresolved consequential owner choice returns `USER_DECISION_REQUIRED`; failed or missing mandatory evidence returns `BLOCKED_EVIDENCE`. `DONE` requires all criteria and gates.

Archival first persists and binds the exact approved close contract.
