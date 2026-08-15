# ADR 0019 — Curiosity Cursor research split

**Accepted, 2026-08-15.** Rename the private package, plugin, repository, and new capture-state identity to `curiosity-cursor-plugin`. Retain only demonstrably complete agent routing, resources, handoff compilation, generic redacted capture, and pure Ledger domain/archive primitives.

Remove native loop execution and Ledger lifecycle runtime exposure, along with uncomposed typed engineering/effect scaffolding and the graph proposal. Preserve historical ADRs and provenance as history; this decision supersedes their claims about the currently shipped runtime.

`/loop-*` markdown aliases remain temporarily as a complete deprecation surface, but all runtime operations fail closed and make no native-runtime claim. Native Cursor conversion and explicit command mapping remain future research, not an implemented capability.
