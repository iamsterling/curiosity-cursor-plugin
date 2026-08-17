---
description: Produce a bounded architecture recommendation for owner selection.
---

# Architecture

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
      "intent": "LOCAL_DECISION",
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
        "trade-offs",
        "falsifier",
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
      "intent": "EXTERNAL_FACT_ASSISTED",
      "tasks": [
        {
          "agent": "curiosity-strategist",
          "skills": [
            "curiosity-decision-design"
          ],
          "mode": "read-only"
        }
      ],
      "optionalTasks": [
        {
          "agent": "curiosity-researcher",
          "skills": [
            "curiosity-research-evidence"
          ],
          "mode": "read-only",
          "when": "DECISION_CHANGING_CURRENT_OR_EXTERNAL_FACTS",
          "network": "EXPLICIT_AUTHORIZATION_REQUIRED"
        }
      ],
      "writerCount": 0,
      "ownerGate": "REQUIRED",
      "review": "NONE",
      "evidence": [
        "source anchors",
        "options",
        "trade-offs",
        "owner decision"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "USER_DECISION_REQUIRED",
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "network": "EXPLICIT_AUTHORIZATION_REQUIRED"
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

This is a semantic routing prompt, not host-enforced scheduling. Main must not emulate or perform specialist architecture work. Apply the canonical authority rule, Curiosity Gate, receipts, evidence capsules, model caveats, parent no-edit/no-mutating-shell boundary, and bounded cycles. Return `BLOCKED_ROUTING` if any required named agent, skill, or Task is unavailable.

This command is strictly no writes. Dispatch exactly one `curiosity-strategist` Task requiring `curiosity-decision-design`. Dispatch the optional `curiosity-researcher` Task with `curiosity-research-evidence` only when decision-changing current or external facts are actually needed; network access then requires explicit authorization. A researcher that is unavailable when this condition is false must not block strategist-only local architecture. Dispatch no writing agent.

Require a decision frame, owner-decision sweep, 2–4 viable options, quality scenarios, trade-offs, assumptions, falsifier, reversibility/rollback, recommendation, and proposed ADR outline. Main reconciles receipts and returns the recommendation only as advice. The explicit owner selects; unresolved consequential choices return `USER_DECISION_REQUIRED`, never an implied decision.
