# ADR 0026: Usage-driven Cursor-native delivery bundle

**Accepted, 2026-08-16.**

## Decision

Ship a file-only Cursor-native bundle in which the main Cursor Agent is the sole editor and synthesizer. Register exactly three read-only specialists—strategist, reviewer, and researcher—plus one implementation-discipline skill, one explicit deliver-change command, and one concise always-applied rule. Built-in Explore owns broad discovery and native Plan Mode owns consequential planning.

Remove the custom coordinator, analyst, worker, generalist, implementer, old engineering skill, and broad software-architecture skill from the installed surface. Do not provide backward-compatible aliases. Static model preferences are strategist/researcher `grok-4.6` and reviewer `claude-sonnet-5`; the main Agent inherits the user's selection and Explore remains Cursor-managed. Pins are preferences with compatible fallback, not guaranteed backend identity.

## Rationale and consequences

The sanitized usage snapshot shows broad general/explore work dominates, while review, implementation discipline, strategy, and research recur as narrower needs. Its dominant motif is discovery, editing, project checks, then independent review. Cursor already supplies discovery, planning, editing, and synthesis, so duplicating them as custom roles adds surface without evidence of benefit. The three specialists preserve differentiated judgment; the skill and command preserve test-first/evidence discipline.

The installed surface has no scripts, executable hooks, SDK, MCP, CLI wrapper, service, daemon, custom store, transcript parser, or external runtime. Project-supplied commands may run conditionally through Cursor's terminal; tools are never installed. Prompt policy cannot prove compliance, scheduling, model identity, or reviewer resumption, so tests validate declarations and prohibited assets while docs retain host/version caveats.

The separate OpenCode foundation, repository development tooling, capture code, and temporary `/loop-*` aliases remain intact and are not Cursor runtime dependencies. Broader skill imports are deferred for license and provenance review.

This revision replaces this ADR's uncommitted eight-role design and supersedes ADR 0025's command-hook decision plus the installed-behavior assumptions in ADRs 0021, 0022, and 0024. Those records remain historical. The authoritative boundary is [`../specs/vanilla-cursor-native-orchestration.md`](../specs/vanilla-cursor-native-orchestration.md); evidence and limitations are in [`../provenance/cursor-usage-analysis-2026-08-16.md`](../provenance/cursor-usage-analysis-2026-08-16.md).
