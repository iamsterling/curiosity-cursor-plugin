# ADR 0031: Command-oriented routing fallback

- **Status:** Accepted
- **Date:** 2026-08-17

## Context

One general delivery command made common intent routes implicit. Cursor plugin commands can provide focused prompts, but the checked-in manifest and Markdown cannot enforce Task scheduling, agent availability, skill attachment, tool permissions, or model selection.

## Decision

Retain `/curiosity-deliver-change` and add prefixed bug, feature, deep-research, review, secure, verify, and architecture commands. Each command names its exact specialist dispatch and semantic skill requirement, preserves the canonical authority/curiosity/evidence policy, and fails closed as `BLOCKED_ROUTING` when required Task routing is unavailable. Main does not emulate specialist work. Read-only routes dispatch no writer; writable routes retain one implementer and independent review. Architecture and security-boundary choices remain owner decisions.

## Consequences

For the 0.7 release, the installed inventory became four agents, five skills, eight commands, and one rule; ADR 0032 records the current 0.8 expansion to twelve commands without scripts or runtime dependencies. Intent selection is clearer, but compliance remains prompt-governed. Static tests prove asset shape and authored contracts only; live discovery, dispatch, permissions, model fallback, and adherence require the unexecuted isolated Cursor smoke plan.
