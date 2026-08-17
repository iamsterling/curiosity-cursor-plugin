# ADR 0032: File-only durable change lifecycle

**Status:** Accepted technical route; governance decision unresolved

## Context

The command bundle needs durable spec, ledger, implementation, and close routes. User-requested packages under `openspec/changes/` use OpenSpec-compatible planning conventions. The repository constitution says OpenSpec is not adopted.

## Decision

Add `/curiosity-spec`, `/curiosity-ledger`, `/curiosity-implement`, and `/curiosity-close` as semantic file-only routes. They use the existing four agents and five skills, exactly one implementer where persistence is authorized, fresh independent review after writes, and the canonical terminal status precedence. Main never writes, runs mutating shell, or emulates a specialist.

The packages are non-runtime planning inputs. Commands do not invoke an OpenSpec CLI, install a runtime, silently modify `AGENTS.md`, or claim repository-wide adoption.

## Unresolved governance decision gate

**OWNER DECISION REQUIRED:** decide separately whether this repository will formally adopt OpenSpec and update its constitution. Until that explicit reviewed decision, compatibility is not adoption. Technical implementation may proceed because the routes operate on ordinary approved files and do not require formal adoption.

## Consequences

The installed inventory becomes four agents, five skills, twelve commands, and one rule. Static tests can prove authored route facts and file boundaries; live Cursor discovery, semantic dispatch, permissions, network confinement, and compliance remain unverified until the isolated smoke plan runs.
