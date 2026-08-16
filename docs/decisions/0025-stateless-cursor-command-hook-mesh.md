# ADR 0025: Stateless Cursor command-hook mesh

## Decision

Replace the inert stop hook with the command-only v0.4.0 mesh specified in [`../specs/cursor-hook-mesh.md`](../specs/cursor-hook-mesh.md). Use one stateless dispatcher for six events. Protect writable handoffs, shell execution, and reads with fail-closed definitions; keep session, evidence reminder, and compaction guidance fail-open. Remove stop and defer generic preToolUse, prompt hooks, MCP hooks, and all other lifecycle surfaces.

## Rationale

Cursor already owns runtime state and native permission decisions. A narrow command mesh can validate handoff shape, request approval for enumerated consequential commands, deny exact transcript-path access, and remind the parent to reconcile evidence without inventing a second runtime. Mixed failure posture preserves protected boundaries while avoiding guidance-hook outages blocking work.

## Consequences

The shell screen is lexical and intentionally incomplete. Handoff validation proves shape only. The evidence hook neither reads output nor decides PASS/FAIL/MISSING. Compaction guidance supports manual reconstruction but does not restore state. No hook parses transcripts, persists data, starts services, schedules work, controls MCP, or follows up automatically.
