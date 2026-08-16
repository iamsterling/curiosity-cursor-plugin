---
name: curiosity-implementation-discipline
description: Apply test-first, minimal-change, evidence-based implementation discipline in the main Cursor Agent.
---

# Curiosity implementation discipline

The main Cursor Agent is the sole editor and synthesizer.

1. Convert the requested outcome into binary acceptance checks. Stop and ask on blocking ambiguity.
2. Inspect current source, tests, repository instructions, package boundaries, and stable diagnostics. Use Cursor's native Explore for broad discovery.
3. Before changing behavior, add and run a focused failing behavior test. For existing untested behavior, add characterization first.
4. Make the smallest root-cause patch. Do not refactor unrelated code, weaken tests, or cross package boundaries without accepted cause.
5. Use only project-supplied or project-documented commands through Cursor's native terminal. Do not guess commands. Do not install tools or bootstrap dependencies.
6. Run focused tests, then repository-required type, lint, build, security, or verification checks that the project actually supports. Selected verification must map each acceptance check to raw evidence; Todo state is not proof.
7. Report changed paths, raw output and exit status for each command, unrun checks, blockers, and remaining uncertainty. Preserve failures verbatim enough to diagnose them.

Read-only specialists advise; they never edit. The main Agent decides and applies the final patch.
