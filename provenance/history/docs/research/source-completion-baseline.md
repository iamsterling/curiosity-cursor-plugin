# Source completion baseline

**Point-in-time assessment: 2026-08-15.** This records the evidence used to split the Cursor-research boundary; it is not permanent truth or a claim that Cursor migration is complete.

- Source repository: `iamsterling.opencode2-config`
- Assessed source SHA: `b803fdba77e288dc3c881883101419e74683b450`
- Boundary-test commit: `6c692eac974c65a59d38d05e1e539ce544f83c87`
- Split commit: `b8068591a12c82fc40b3b5824b4152379bc15344`

`COMPLETE` means an accepted and tested bounded contract, not every imaginable capability. `MIXED` means separable completed and incomplete parts existed. `WIP` means implementation or research had not met its bounded contract. `ABSENT` means no implementation existed.

| Area | Baseline | Split disposition |
| --- | --- | --- |
| Native loop | WIP | Removed |
| Loop compatibility | COMPLETE | Retained as fail-closed aliases |
| Ledger | MIXED | Completed domain/archive retained; incomplete runtime authority removed |
| Graph | WIP | Research proposal removed |
| Beads | ABSENT | No engine; provenance retained |
| OpenSpec | ABSENT | Not adopted; provenance retained |
| Orchestration | MIXED | Completed agent routing retained; no-op stub removed |
| Agents | COMPLETE | Retained |
| Skills | COMPLETE as prompt assets | Retained |
| Curiosity | COMPLETE as bounded policy; autonomous engine absent | Policy retained |
| Engineering intent | MIXED | Commands and skill retained; typed scaffolding removed |
| Handoff | COMPLETE as planning-only compiler | Retained |

## Evidence

Key source paths at the assessed SHA were:

- loop and compatibility: `src/features/loop-engine/`, `tests/unit/native-loop-completion.test.mjs`, `assets/commands/loop-*.md`, and `tests/characterization/release-manifest-dispositions.test.mjs`;
- Ledger: `src/features/ledger/{domain.ts,archive.ts,index.ts}` and `tests/unit/ledger-*.test.mjs`;
- graph, Beads, and OpenSpec: `docs/research/graph-engineering.md`, `docs/decisions/0012-ledger-native-product.md`, `docs/generic-bundle.md`, and `provenance/manifests/generic-consolidation-2026-08-11.json`;
- orchestration and agents: `src/features/orchestration/index.ts`, `src/features/config/agents.ts`, and `assets/config/agents/`;
- skills and curiosity policy: `assets/skills/`, especially `deep-research`, `goal-loop`, `review`, and `verify`, plus the `CURIOSITY_NO_GO` verdict now preserved in `docs/research/README.md`;
- engineering intent: `assets/commands/{bug,feature,secure}.md`, `assets/skills/engineering-pursuit/SKILL.md`, and `src/features/engineering-intent/`;
- handoff: `src/features/handoff/compiler.mjs`, `assets/skills/handoff-compiler/`, and `tests/unit/handoff-contract.test.mjs`.

The split's final local verification reported `bun run verify` passing: architecture covered 30 source files and 64 assets; core tests were 66/66, integration tests 12/12, characterization tests 10/10 plus the installer scenario, and security tests 12/12. Real-host, staged-release, resource-size, artifact, provenance/relocation, and secret checks also passed. The split boundary itself is mechanically captured in `tests/characterization/curiosity-boundary.test.mjs`.

## Reassessment

Reassess an area when its contract changes, new runtime code or host capability is introduced, removed code is reconsidered, or new focused tests and verification evidence contradict this baseline. Record a new dated assessment rather than silently rewriting this one.
