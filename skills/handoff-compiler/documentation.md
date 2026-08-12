# Handoff compiler — current proposal boundary

## Current

This Stage-2 skill compiles already-made decisions into a provider-neutral planning proposal. It is a pure validation library with no persistence or execution integration. Generated contracts are proposals; loop lifecycle and evidence authority remain external.

Invoke `/compile-handoff <task-or-reference>` after the caller supplies the decision input. The command returns a proposal or stable diagnostics only.

## Schema

`handoff-contract/v1` is bounded and omit-empty. Applicable fields are `schema`, `id`, `revision`, `taskClass`, `objective`, `invariant`, `scope`, `nonGoals`, `assumptions`, `units`, `dependencies`, `context`, `criteria`, `toolLimits`, `handback`, and explicitly-authorized `parallel`.

A unit has an objective plus exclusive `ownedArtifacts` or `readOnlyEvidence`, optional forbidden surfaces, merge owner, and dependencies. Context references have `locator`, `provenance`, `freshness`, and treatment: `quote`, `reference`, `summary`, or `worker-fetch`. Criteria name an oracle and `red-green`, `static`, `before-after`, `parse`, or `review` evidence kind. Behavioral tasks need red/green behavior evidence; documentation, configuration, and mechanical tasks use focused parse/static/before-after evidence. Core handback is status, result artifacts, criterion evidence, and blocker when present.

## Diagnostics

`HANDOFF_SCHEMA_VERSION_UNSUPPORTED`, `HANDOFF_SHAPE_INVALID`, `HANDOFF_BLOCKING_AMBIGUITY`, `HANDOFF_OWNERSHIP_CONFLICT`, `HANDOFF_DEPENDENCY_MISSING`, `HANDOFF_DEPENDENCY_CYCLE`, `HANDOFF_PARALLEL_UNAUTHORIZED`, `HANDOFF_CONTEXT_INVALID`, `HANDOFF_CONTEXT_STALE`, `HANDOFF_CRITERION_UNVERIFIABLE`, `HANDOFF_EVIDENCE_KIND_MISMATCH`, `HANDOFF_COMPLETION_AUTHORITY_VIOLATION`, and `HANDOFF_POLICY_DENIED` carry separate `path` and `detail` values.

## Examples

A small documentation correction has one caller-selected unit, exclusive document/fixture artifacts, a parse oracle, and only core handback. A behavioral bug has implementation and focused-test artifacts under one unit plus `red-green` evidence. Independent mixed-capability units need an explicit `parallel.authorized: true`; research followed by integration is represented by an unmet dependency without parallel representation. An ambiguous consequential request returns `HANDOFF_BLOCKING_AMBIGUITY` with no proposal.

## Non-goals

The compiler is not an orchestrator, scheduler, lifecycle owner, semantic judge, or workflow framework. It does not set provider/model values, infer policy, or grant completion.

## Stage-3 seam

An external integration may pass its decisions to `compileHandoff(input)` and consume the immutable proposal and diagnostics. It remains responsible for execution, evidence collection, lifecycle updates, and any repository policy enforcement.
