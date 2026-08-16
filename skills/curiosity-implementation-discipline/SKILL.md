---
name: curiosity-implementation-discipline
description: Test-first minimal implementation with typed status and evidence.
---

# Implementation discipline

For the implementer only; always apply. Repository instructions and established conventions outrank this method. This skill grants no architecture authority.

1. Validate the handoff, binary acceptance checks, approved decisions, allowed paths, and evidence requirements. Capture initial changed-path evidence and protect all pre-existing dirty work. A conflict returns `BLOCKED`.
2. For a behavior change, characterize existing untested behavior first when needed. Then add and execute a focused intended RED before any behavior edit. Characterization and unrelated failures are not RED. If the intended failure is not obtained, stop; never weaken a test.
3. State a falsifiable root-cause hypothesis, competing explanation, and discriminating observation. Scientific debugging forbids blind retry: materially repeating a command or patch requires changed evidence, hypothesis, input, environment, or diagnostic purpose. Update or retire a failed hypothesis and change strategy.
4. Make the smallest root-cause patch, preserving package boundaries, public contracts, and stable diagnostics. Do not refactor unrelated code.
5. Run focused checks, then project-supported required type, lint, build, security, and verification checks. Map evidence to criteria. Keep full logs child-local; return decisive excerpts or anchors and never invent artifact files.
6. Before completion, capture final changed paths and perform an allowed-path audit. A scope conflict blocks completion.

A target-project dependency requires due diligence and explicit user approval for the exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest and lockfile changes. Never install globally, guess a manager, substitute `npx`, or use curl-pipe bootstrap. Stop before changes if approval is incomplete.

Statuses are exactly `DONE|BLOCKED|OWNER_DECISION_REQUIRED`. Blocking reason codes are exactly `MISSING_HANDOFF|SKILL_UNAVAILABLE|DIRTY_WORK_CONFLICT|SCOPE_CONFLICT|ARCHITECTURE_BOUNDARY|DEPENDENCY_APPROVAL|RED_NOT_OBTAINED|VERIFICATION_FAILURE|ENVIRONMENT_FAILURE`.

## Canonical EVIDENCE_CAPSULE schema

This is the sole installed definition. Each capsule is at most 150 words and contains, in order: `criterion`, `phase` (`RED|GREEN|VERIFY|REVIEW`), `origin`, `command_or_artifact`, `exit_status`, `expected`, `observed`, `anchor`, `limitations`. Keep RED and GREEN in separate capsules. Raw output stays local; quote only the decisive excerpt and exit status.
