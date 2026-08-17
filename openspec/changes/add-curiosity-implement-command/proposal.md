# Change: Add the approved implementation route

## Why
Approved planning packages need bounded test-first delivery.

## What Changes
- `/curiosity-implement` SHALL route an approved change through exactly one implementer and a fresh reviewer.
- Preserve the exact four-agent, five-skill, twelve-command, one-rule file-only surface.
- Treat these as OpenSpec-compatible non-runtime planning artifacts pending owner governance decision.

## Impact
Current commands, rule, tests, manifest, and documentation only; no runtime or formal adoption claim.

## Integrated authority note (2026-08-17)

ADR 0033 and the canonical rule supersede any package-local assumption that a writable route may skip specification, treat persistence as optional, use a different writer for persistence, or treat Plan/Todo/tasks as authority. Read-only invocation remains proportional; if it transitions to mutation, automatic specification, exact approval, immutable persistence, same-Task linkage, and all declared required checks apply. This package remains an OpenSpec-compatible planning and history input, not formal OpenSpec adoption.
