---
name: curiosity-architecture-awareness
description: Detect consequential boundaries before bounded implementation writes.
---

# Architecture awareness

For the implementer only; always apply before writing. It detects boundaries but must not choose or select architecture.

Inspect relevant module, domain, and package boundaries; coupling and cohesion; public contracts; data and interface effects; security and trust effects; failure behavior; test seam; reversibility; and established repository patterns and vocabulary. Do not impose arbitrary line limits, universal DDD or Clean Architecture, vendor prescriptions, or blanket library-first policy.

Produce a compact **Architecture Boundary Card** before edits: current boundary; intended touched paths/symbols; contracts and data/interface/security effects; failure and test seams; reversibility; pattern followed; consequential boundary result. If the task would create, choose, or cross a consequential boundary—including a disguised schema, dependency, trust, deployment, compatibility, public API, or persistence decision—make no edit and return `OWNER_DECISION_REQUIRED` with `ARCHITECTURE_BOUNDARY`. The strategist owns that decision.
