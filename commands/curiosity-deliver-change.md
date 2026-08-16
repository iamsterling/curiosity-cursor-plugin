---
description: Deliver one verified change with Cursor-native discovery, planning, implementation, and review.
---

# Deliver change

1. Restate the requested outcome, constraints, non-goals, and binary acceptance criteria. Stop and ask if blocking ambiguity remains.
2. Create concise native Todo items as a progress aid. Use built-in **Explore** for broad codebase discovery; inspect repository instructions and current tests. Do not depend on any undocumented Task or Todo schema.
3. If the change is consequential, ask the user to use native **Plan Mode** and optionally consult `curiosity-strategist`; obtain plan acceptance before editing. Otherwise state why a lightweight path is safe.
4. The **main Agent implements** as sole editor using `curiosity-implementation-discipline`: behavior test RED first, smallest root-cause patch, stable diagnostics, no unrelated refactor.
5. Run focused tests and project-supported required checks only. Never install a tool or substitute an unapproved external runtime. Capture raw outputs and exit status; missing checks remain missing.
6. Ask `curiosity-reviewer` to act as the independent reviewer of criteria, diff, source, and raw evidence. If blocked, the main Agent repairs and resumes the same reviewer. Allow a maximum of two review cycles total; after the second blocked verdict, stop and report.
7. Return an evidence summary mapping acceptance criteria to PASS/FAIL/MISSING, reviewer verdict, changed paths, command outputs, and remaining host or project uncertainty. Todo completion never overrides raw evidence.
