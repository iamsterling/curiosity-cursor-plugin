---
description: Research a bounded decision question without changing the workspace.
---

# Deep research

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
      "intent": "EXTERNAL_DECISION_RESEARCH",
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
        "claim ledger",
        "source anchors",
        "limits",
        "receipt"
      ],
      "terminalStatuses": [
        "BLOCKED_ROUTING",
        "BLOCKED_AUTHORITY",
        "USER_DECISION_REQUIRED",
        "BLOCKED_EVIDENCE",
        "DONE"
      ],
      "network": "EXPLICIT_AUTHORIZATION_REQUIRED",
      "budgets": {
        "source": "REQUIRED_NUMERIC_MAX",
        "time": "REQUIRED_BOUNDED"
      },
      "curiosityPass": {
        "max": 1,
        "selection": "HIGHEST_DECISION_VALUE_WITHIN_AUTHORITY"
      },
      "parentSynthesis": "COMPRESSED_RECONCILIATION_ONLY",
      "statusDimensions": [
        "routing",
        "authority",
        "evidence"
      ],
      "output": {
        "required": [
          "claimType",
          "evidenceOrigin",
          "confidence",
          "citationAccessVersionScope",
          "contradictions",
          "negativeResults",
          "decisionVerdict",
          "evidenceStatus"
        ]
      },
      "reasonCodes": {
        "routing": [
          "TASK_UNAVAILABLE",
          "AGENT_UNAVAILABLE",
          "SKILL_UNAVAILABLE"
        ],
        "authority": [
          "NETWORK_UNAUTHORIZED",
          "SOURCE_OUT_OF_SCOPE"
        ],
        "evidence": [
          "BUDGET_MISSING",
          "EVIDENCE_INSUFFICIENT",
          "SOURCE_CONFLICT_UNRESOLVED"
        ]
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

This is a semantic routing prompt, not host-enforced scheduling. Main must not emulate a researcher or perform specialist research. Apply the canonical rule's Curiosity Gate, receipts, evidence capsules, model caveats, parent no-edit/no-mutating-shell boundary, and bounded cycles. If the named agent, skill, or Task is unavailable, return `BLOCKED_ROUTING`.

Authority is strictly read-only: no writes and no mutation. Network access requires explicit authorization from the user and current tool envelope; read-only metadata is not network authority. If external evidence is needed but access is absent or denied, return `BLOCKED_AUTHORITY` with `NETWORK_UNAUTHORIZED` without attempting access. Before dispatch, require both a numeric maximum source budget and a wall-clock or equivalent bounded time budget, plus the decision frame, decision-changing unknowns, permitted source classes/version scope, and a `COVERAGE|SATURATION|EXHAUSTION|BLOCKED` stopping rule. Missing either budget is blocking ambiguity. Dispatch exactly one `curiosity-researcher` Task requiring the actual `curiosity-research-evidence` skill; dispatch no writer or other custom specialist.

Require the research skill's evidence taxonomy: every material claim carries a claim type, an evidence-origin label (`RESEARCHER_OBSERVED|PARENT_SUPPLIED|WORKSPACE_ARTIFACT|UNVERIFIED_SUMMARY`), and `HIGH|MEDIUM|LOW` confidence with basis. Give primary sources priority; citations include stable locator, publisher/title, direct origin, access date, and applicable version/date/population/scope where applicable; explicitly map contradictions; and record bounded negative results describing what was searched and not found. The decision verdict is separately `SUPPORTED|FALSIFIED|UNRESOLVED|NOT_APPLICABLE`; diagnostic evidence status is separately `EVIDENCE_SUFFICIENT|EVIDENCE_LIMITED|EVIDENCE_BLOCKED`. Report routing, authority, and evidence independently with exact reasons: routing `TASK_UNAVAILABLE|AGENT_UNAVAILABLE|SKILL_UNAVAILABLE`; authority `NETWORK_UNAUTHORIZED|SOURCE_OUT_OF_SCOPE`; evidence `BUDGET_MISSING|EVIDENCE_INSUFFICIENT|SOURCE_CONFLICT_UNRESOLVED`. Never collapse these dimensions to the receipt's generic stop reason. A consequential unresolved decision returns `USER_DECISION_REQUIRED` after routing and authority succeed.

Allow exactly one curiosity pass: the bounded highest-decision-value probe within both budgets and authority, or state `CURIOSITY_NO_GO`; record rejected material threads as `CURIOSITY_NO_GO` and start no autonomous follow-up. Main performs compressed parent synthesis of the compressed result only: reconcile it against the original frame, budgets, authority, contradictions, gaps, and decision impact without browsing, repeating searches, or adding uncited claims. Return independent routing, authority, and evidence dimensions, the compact claim ledger, gaps/saturation, and the canonical receipt.
