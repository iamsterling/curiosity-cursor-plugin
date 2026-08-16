# ADR 0030: Role authority and composable expertise

**Status:** Accepted
**Date:** 2026-08-16

## Context

The 0.5 bundle placed substantial methods in role prompts and exposed only implementation discipline as a skill. That made authority and expertise harder to distinguish, repeated guidance across assets, and left boundary detection implicit.

## Decision

Keep exactly four agents, but assign independent authority by role: main orchestrates and synthesizes; Explore discovers repository facts; strategist alone designs consequential architecture choices; researcher handles external/version-sensitive evidence; implementer alone writes within approved boundaries; reviewer independently evaluates without repair. Keep curiosity and evidence universal.

Expose exactly five composable skills: implementation discipline and architecture awareness for the implementer, decision design for the strategist, research evidence for the researcher, and independent review for the reviewer. `REQUIRED SKILLS` is a semantic prompt contract, not a claimed Cursor attachment API. Missing skill availability blocks the role.

Classify work as PROBE, BOUNDED, or ARCHITECTURAL. Classification only escalates. An architectural classification requires Explore, strategist (and optional research), explicit owner decision, then implementation and review. Architecture awareness detects disguised boundaries but cannot select architecture.

## Consequences

Role prompts become smaller and retain identity, authority, triggers, required skills, statuses, blocking behavior, receipt reference, and model fallback caveat. Skills own methods; the command owns sequencing and routing; the rule owns universal authority and gates. Static behavioral fixtures test authored contracts but cannot prove live Cursor behavior. The Cursor-only, no-runtime boundary remains unchanged.

## Alternatives

One general agent would reduce files but weaken independent context and review authority. More specialized agents would increase routing and context cost. Runtime skill loading or enforcement would violate the product boundary. Keeping methods entirely in agents would preserve 0.5 layout but retain duplication and weak composability.
