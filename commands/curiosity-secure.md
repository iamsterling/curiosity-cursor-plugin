---
description: Review a threat boundary or route one explicitly authorized security fix.
---

# Secure

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
      "intent": "THREAT_REVIEW",
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
        "threat assumptions",
        "findings",
        "evidence origins",
        "verdict"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "BLOCKED_EVIDENCE",
        "DONE"
      ]
    },
    {
      "intent": "TRUST_ARCHITECTURE",
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
        "options",
        "threat boundaries",
        "owner decision"
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
      "intent": "CURRENT_EXTERNAL_FACTS",
      "tasks": [
        {
          "agent": "curiosity-researcher",
          "skills": [
            "curiosity-research-evidence"
          ],
          "mode": "read-only"
        }
      ],
      "writerCount": 0,
      "ownerGate": "NONE",
      "review": "NONE",
      "evidence": [
        "current primary sources",
        "scope",
        "limits"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "network": "EXPLICIT_AUTHORIZATION_REQUIRED"
    },
    {
      "intent": "AUTHORIZED_FIX",
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
        "authorized scope",
        "RED",
        "GREEN",
        "VERIFY",
        "security verdict"
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

This is a semantic routing prompt, not host-enforced scheduling. Main must not emulate security, research, implementation, or review specialists. Enforce the canonical authority rule and Curiosity Gate: receipts, evidence capsules, model caveats, parent no-edit/no-mutating-shell boundary, one writer, same-ID correction, and bounded two-cycle review. Return `BLOCKED_ROUTING` when a named agent, skill, or Task is unavailable.

First distinguish a read-only threat review from a requested fix. For a routine threat review, dispatch exactly one fresh `curiosity-reviewer` Task requiring `curiosity-independent-review`; dispatch no writer. For consequential trust boundary or security architecture, dispatch `curiosity-strategist` with `curiosity-decision-design`. An optional curiosity-researcher Task requires `curiosity-research-evidence` only for needed current standards. Require explicit owner approval before security-boundary design changes. No network access is allowed unless explicitly authorized, and never claim ASVS is universally applicable.

For an authorized fix, dispatch exactly one curiosity-implementer Task with `curiosity-implementation-discipline` and `curiosity-architecture-awareness`, requiring intended RED, smallest patch, and raw verification. Then dispatch a fresh `curiosity-reviewer` with `curiosity-independent-review` for a security pass. Without fix authorization, dispatch no writer. Apply the canonical evidence gate and report criteria, threat assumptions, origins, verdict, and residual risk.

An authorized fix automatically persists its approved threat-bound contract before editing.
