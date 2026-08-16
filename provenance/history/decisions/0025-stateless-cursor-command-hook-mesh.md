# ADR 0025: Stateless Cursor command-hook mesh

**Superseded by [ADR 0026](0026-vanilla-cursor-native-orchestration.md), 2026-08-16.** The executable assets and their normative mesh specification were removed from the installed Cursor surface.

## Decision

The historical v0.4.0 decision replaced the inert stop hook with one stateless command dispatcher for six events. It bound an expected event in each command and mixed fail-open guidance with fail-closed handoff/shell/read policy. ADR 0026 rejects that executable boundary for the vanilla-native MVP; this paragraph records history and is no longer operative.

## Rationale

Cursor already owns runtime state and native permission decisions. A narrow command mesh can validate handoff shape plus exact official `subagent_type`/declared-role identity, request approval for enumerated consequential commands, deny exact transcript-path access, and remind the parent to reconcile evidence without inventing a second runtime. Static event binding lets empty, malformed, and oversized protected input fail closed without trying to infer authority from attacker-controlled raw JSON. Parsed payloads must contain one root discriminator matching the binding; malformed guidance remains inert.

## Consequences

The shell screen is direct-form token/pattern classification and intentionally incomplete. Its normative class and boundary matrix is in the specification; it makes no shell-parsing or obfuscation-resistance claim and never rewrites commands. Handoff validation proves shape and declared/runtime name equality only. The evidence hook neither reads output nor decides PASS/FAIL/MISSING. Compaction guidance supports manual reconstruction but does not restore state. No hook parses transcripts, persists data, starts services, schedules work, controls MCP, or follows up automatically.
