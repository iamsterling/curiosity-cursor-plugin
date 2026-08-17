---
description: Draft and immutably persist an executable specification before writes.
---

# Spec

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
      "intent": "DRAFT",
      "tasks": [
        {
          "agent": "curiosity-strategist",
          "skills": [
            "curiosity-decision-design"
          ],
          "mode": "read-only"
        }
      ],
      "writerCount": 0,
      "ownerGate": "REQUIRED",
      "review": "NONE",
      "evidence": [
        "decision frame",
        "binary criteria",
        "owner disposition"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "USER_DECISION_REQUIRED",
        "BLOCKED_EVIDENCE",
        "DONE"
      ]
    },
    {
      "intent": "PERSIST",
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
        "approved exact content and paths",
        "structural checks",
        "identity audit",
        "verdict"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "USER_DECISION_REQUIRED",
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "persistence": "IMMUTABLE_SAME_IMPLEMENTER_TASK_BEFORE_MUTATION",
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
  "intentFlow": "EXTRACT_THEN_CLARIFY_CONSEQUENTIAL_CHOICES_BEFORE_FREEZE",
  "draftArtifact": {
    "identity": "INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN",
    "revision": "ZERO_PADDED_MONOTONIC",
    "digest": "SHA256_CANONICAL_CONTENT",
    "requirements": [
      "ADDED",
      "MODIFIED_WHERE_APPLICABLE"
    ],
    "scenarios": "GIVEN_WHEN_THEN_PER_REQUIREMENT",
    "dependenciesMigrationCompatibility": "REQUIRED_DISPOSITION",
    "planTodoTasks": "NON_AUTHORITATIVE_PROJECTION",
    "writes": false
  },
  "approval": [
    "APPROVE <change-id>@rNNNN SHA256:<digest>",
    "REVISE <change-id>@rNNNN: <changes>",
    "REJECT <change-id>@rNNNN"
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
  },
  "reasonCodes": {
    "routing": [
      "TASK_UNAVAILABLE",
      "AGENT_UNAVAILABLE",
      "SKILL_UNAVAILABLE"
    ],
    "owner": [
      "ASKQUESTION_UNAVAILABLE",
      "ASKQUESTION_CANCELLED",
      "CONSEQUENTIAL_CHOICE_UNRESOLVED"
    ],
    "evidence": [
      "PATH_CONFLICT",
      "PARTIAL_PERSISTENCE",
      "SPEC_DIGEST_MISMATCH",
      "SPEC_STALE_OR_MISMATCHED"
    ]
  }
}
-->

This is a bounded semantic routing prompt, not host-enforced scheduling. Main never emulates specialists, writes files, or runs mutating shell. Apply the canonical authority rule, status precedence, Curiosity Gate, and evidence gates; route failures use distinct `TASK_UNAVAILABLE|AGENT_UNAVAILABLE|SKILL_UNAVAILABLE` reasons.

For `DRAFT`, extract intent and run low-cost Explore before questions. Classify unknowns `DISCOVERABLE|HARMLESS|CONSEQUENTIAL`; never ask for repository-discoverable facts, record reversible harmless defaults, and never default consequential choices. Use optional bounded research only when decision-changing. The strategist synthesizes the complete canonical `INTENT_ACCEPTANCE_CONTRACT <change-id>@rNNNN`, including dependencies and migration/compatibility disposition, requirements/scenarios, criteria/evidence/DOD, boundary, risk, approval, receipt, and linkage. Plan/Todo/tasks are non-authoritative projections.

For unresolved consequential choices, use host-dependent model-steered AskQuestion with finite options, recommendation first, at most three questions per batch and two batches. Absent, skipped, cancelled, or unsupported AskQuestion returns structured `USER_DECISION_REQUIRED`; no silent continuation. Exact approval is `APPROVE <change-id>@rNNNN SHA256:<digest>`; revise/reject must name the same identity.

For `PERSIST`, the same sole implementer Task runs `SPEC_PERSIST_AND_MUTATE`: it stages and immutably persists the package, computes the canonical `contract_sha256` over only `design.md`, `proposal.md`, and `specs/<slug>/spec.md`, writes `approval.md` last with the algorithm and included/excluded paths, recomputes the one aggregate from read-back bytes, and returns the receipt before any requested bounded mutation. `tasks.md`, `approval.md`, and append-only `evidence.md` are excluded. Path conflict, partial persistence, `SPEC_DIGEST_MISMATCH`, stale identity, or approval mismatch blocks evidence. A fresh reviewer audits exact package parity. This is OpenSpec-compatible file authority without CLI or formal adoption.
