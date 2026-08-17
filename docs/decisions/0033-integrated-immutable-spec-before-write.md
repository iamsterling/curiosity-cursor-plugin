# ADR 0033: Integrated immutable spec-before-write authority

**Status:** Accepted; supersedes conflicting portions of ADR 0032

## Context

Manual or optional specification persistence permits a writable route to act on implied, stale, or unauditable intent. Cursor can expose a model-steered question tool, but availability and semantic compliance vary by host context.

## Decision

Every writable route automatically localizes repository facts, resolves typed unknowns, displays an identified intent/acceptance contract, obtains exact approval, and persists an immutable OpenSpec-compatible package before any other mutation. The same sole implementer Task persists and mutates; approval, revision, digest, receipt, and execution linkage must match. `approval.md` is the last-write commit marker. Plan/Todo/tasks are projections only. Consequential choices use `AskQuestion` when exposed and otherwise stop with a structured `USER_DECISION_REQUIRED`; no host-enforcement claim is made. All available repository-declared full checks are mandatory after focused checks.

This supersedes ADR 0032 only where it allowed manual invocation, optional persistence, or separate persistence/implementation assignments. Compatibility is not formal OpenSpec adoption and requires no CLI.

## Consequences and reversal

Writes cost more orchestration and immutable revisions consume repository space, but every mutation has reviewable authority and evidence. Static assets express semantic behavior; Cursor may still ignore prompts or omit AskQuestion. Reverse by a reviewed ADR that replaces the canonical rule, migration contract, and all writer routes together; never weaken only one route.
