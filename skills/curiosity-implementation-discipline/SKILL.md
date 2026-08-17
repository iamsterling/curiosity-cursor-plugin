---
name: curiosity-implementation-discipline
description: Test-first minimal implementation with typed status and evidence.
---

# Implementation discipline

For the implementer only; always apply. Repository instructions and established conventions outrank this method. This skill grants no architecture authority. The handoff must select exactly one invocation mode:

- `SPEC_PERSIST_AND_MUTATE` is writable, requires both `curiosity-implementation-discipline` and `curiosity-architecture-awareness`, and follows steps 1–6 below.
- `VERIFICATION_ONLY` applies `curiosity-implementation-discipline` only. It must not persist or validate a spec package, edit or delete files, or run mutating shell commands. It may run project-supported checks even when they create declared ephemeral caches; declare those cache paths first, capture a before/after status and hash audit, and report any change. For this mode, skip persistence, architecture-card, RED, and patch instructions; apply only check discovery/execution, evidence capsules, and the before/after audit. An undeclared or non-ephemeral change returns `BLOCKED` with `SCOPE_CONFLICT`.

1. Validate the handoff and exact persisted `spec_ref`, revision, content SHA/digest, approval, binary acceptance checks, `REQ`/`SCN`/`AC`/`DOD` mapping, allowed paths, and evidence requirements. Read back the immutable package and stop on stale or mismatched identity. The same implementer Task that persists it remains the sole writer for mutation. Capture initial changed-path evidence and protect all pre-existing dirty work. A conflict returns `BLOCKED`.
2. For a behavior change, characterize existing untested behavior first when needed. Then add and execute a focused intended RED before any behavior edit. Characterization and unrelated failures are not RED. If the intended failure is not obtained, stop; never weaken a test.
3. State a falsifiable root-cause hypothesis, competing explanation, and discriminating observation. Scientific debugging forbids blind retry: materially repeating a command or patch requires changed evidence, hypothesis, input, environment, or diagnostic purpose. Update or retire a failed hypothesis and change strategy.
4. Make the smallest root-cause patch, preserving package boundaries, public contracts, and stable diagnostics. Do not refactor unrelated code.
5. Discover declared required checks from repository instructions, package scripts, CI, and contributing documentation without install, `npx`, bootstrap, or package-manager guessing. Run focused checks, then **all available declared required** full test, lint, typecheck, build, security, package, and verification checks. Focused RED/GREEN never substitutes for full checks: for example, when `npm test` and `npm run lint` are declared, both are mandatory after focused GREEN. Preserve command, exit status, and decisive raw output for every check and map evidence to criteria. An unavailable required check returns `BLOCKED_EVIDENCE REQUIRED_CHECK_UNAVAILABLE`; any failure, including lint after GREEN, returns `BLOCKED_EVIDENCE REQUIRED_CHECK_FAILED`. Never invent artifact files.
6. Before completion, capture final changed paths and perform an allowed-path audit. A scope conflict blocks completion.

A target-project dependency requires due diligence and explicit user approval for the exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest and lockfile changes. Never install globally, guess a manager, substitute `npx`, or use curl-pipe bootstrap. Stop before changes if approval is incomplete.

Statuses are exactly `DONE|BLOCKED|OWNER_DECISION_REQUIRED`. Blocking reason codes are exactly `MISSING_HANDOFF|SKILL_UNAVAILABLE|DIRTY_WORK_CONFLICT|SCOPE_CONFLICT|ARCHITECTURE_BOUNDARY|DEPENDENCY_APPROVAL|RED_NOT_OBTAINED|SPEC_NOT_PERSISTED|SPEC_DIGEST_MISMATCH|SPEC_STALE_OR_MISMATCHED|PATH_CONFLICT|PARTIAL_PERSISTENCE|REQUIRED_CHECK_UNAVAILABLE|REQUIRED_CHECK_FAILED|VERIFICATION_FAILURE|ENVIRONMENT_FAILURE`.

## Canonical EVIDENCE_CAPSULE schema

This is the sole installed definition. Each capsule is at most 150 words and contains, in order: `criterion`, `phase` (`RED|GREEN|VERIFY|REVIEW`), `origin`, `command_or_artifact`, `exit_status`, `expected`, `observed`, `anchor`, `limitations`. Keep RED and GREEN in separate capsules. Raw output stays local; quote only the decisive excerpt and exit status.
