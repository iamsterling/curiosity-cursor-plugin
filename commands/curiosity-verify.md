---
description: Run and audit project-supported verification without editing files.
---

# Verify

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
      "intent": "VERIFY_ONLY",
      "tasks": [
        {
          "agent": "curiosity-implementer",
          "skills": [
            "curiosity-implementation-discipline"
          ],
          "mode": "VERIFICATION_ONLY",
          "invocationMode": "VERIFICATION_ONLY"
        },
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
        "command outputs",
        "changed-path audit",
        "criterion map",
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

This semantic routing prompt is not host-enforced. Main does not run checks and must not emulate or perform either specialist role. Apply the canonical authority rule, Curiosity Gate, receipts, evidence capsules, model caveats, parent no-edit/no-mutating-shell boundary, and bounded reconciliation. If a named agent, skill, or Task is unavailable, return `BLOCKED_ROUTING`.

Dispatch exactly one `curiosity-implementer` Task requiring `curiosity-implementation-discipline` with invocation mode `VERIFICATION_ONLY` (verification-only/no-edit). This mode has no spec-package persistence/read-back, edit, delete, or mutating-shell authority. Discover project-supported checks and required checks from repository instructions, package scripts, CI, and contributing docs, then execute every available declared full test, lint, typecheck, build, security, package, and verification check; focused GREEN never substitutes for them. Project-supported checks may create only ephemeral caches declared before execution. Capture before/after repository status and hashes and report any changes. Do not install, bootstrap, invoke `npx`, guess a package manager, or otherwise mutate files. An unavailable required check returns `BLOCKED_EVIDENCE REQUIRED_CHECK_UNAVAILABLE`; a failed required check returns `BLOCKED_EVIDENCE REQUIRED_CHECK_FAILED`. Require raw command, exit status, expected/observed output, anchors, limitations, and changed-path audit in evidence capsules.

Then dispatch a fresh `curiosity-reviewer` Task requiring `curiosity-independent-review` to audit each criterion/evidence link and independently observe whatever read-only permissions allow. The canonical passing gate permits no passing verdict on raw failure, missing evidence, a material unknown, or `UNVERIFIED_SUMMARY`. Return `PASS|FAIL|MISSING` per criterion and list unrun checks.
