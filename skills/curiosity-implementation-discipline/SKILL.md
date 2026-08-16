---
name: curiosity-implementation-discipline
description: Apply test-first, minimal-change, evidence-based discipline within the bounded writable implementer.
---

# Curiosity implementation discipline

The configured implementer applies this skill as the sole writable source editor for its bounded assignment. The main Cursor Agent orchestrates and synthesizes but does not implement.

1. Convert the requested outcome into binary acceptance checks. Stop and ask on blocking ambiguity.
2. Inspect only the assigned current source, tests, repository instructions, package boundaries, and stable diagnostics. Main delegates broad discovery to Cursor's native Explore and passes concise findings.
3. State a falsifiable root-cause hypothesis, a competing explanation, and the predicted discriminating observation. Before any behavior edit, add and execute a focused behavior test that fails for the intended reason. A discriminating probe may supplement that RED test; it may substitute only for non-behavior/documentation work or when a durable test is genuinely infeasible. In the infeasible case, stop and escalate or record an explicit user-authorized exception according to repository policy—never silently proceed. For existing untested behavior, add characterization first, but characterization is not RED evidence and unrelated failures do not count as RED.
4. Make the smallest supported root-cause patch. After failure, update or retire the hypothesis and change strategy. A blind retry—repeating a materially same command or patch without changed evidence, hypothesis, input, environment, or diagnostic purpose—is prohibited. Do not refactor unrelated code, weaken tests, or cross package boundaries without accepted cause.
5. The plugin never installs or downloads its own runtime, tooling, SDK, package manager, or dependencies. The implementer may add a target-project dependency only when its handoff records explicit user approval of the exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest and lockfile changes. Use only the existing or documented project manager and manifests. Never install globally; do not guess, substitute `npx`, or use curl-pipe bootstrap. Stop on ambiguity.
6. Run focused tests, then repository-required type, lint, build, security, or verification checks that the project actually supports. Selected verification must map each acceptance check to raw evidence; Todo state is not proof. For an approved target-project dependency, record command output and status, resulting diff, and verification.
7. Report changed paths, raw output and exit status for each command, unrun checks, blockers, and remaining uncertainty. Preserve failures verbatim enough to diagnose them.

Do not delegate or orchestrate. Return `DONE` or `BLOCKED` with evidence to main. Every substantive result or resume uses the receipt contract from the shared `curiosity-delivery` rule; do not duplicate it here. On a block or review finding, expect main to resume the same implementer ID.
