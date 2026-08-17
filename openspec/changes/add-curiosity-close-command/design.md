# Design: Add the package close route

## Context
Main orchestrates only and cannot emulate specialists or mutate project, workspace, or temporary paths.

## Decision
`/curiosity-close` SHALL route archive persistence through exactly one implementer and fresh review. Routing failure is distinct from authority, owner decision, and evidence failure.

## Governance
The repository constitution says OpenSpec is not adopted. This package is a compatible planning input only, pending an explicit owner decision.

## Integrated authority note (2026-08-17)

ADR 0033 and the canonical rule supersede any package-local assumption that a writable route may skip specification, treat persistence as optional, use a different writer for persistence, or treat Plan/Todo/tasks as authority. Read-only invocation remains proportional; if it transitions to mutation, automatic specification, exact approval, immutable persistence, same-Task linkage, and all declared required checks apply. This package remains an OpenSpec-compatible planning and history input, not formal OpenSpec adoption.
