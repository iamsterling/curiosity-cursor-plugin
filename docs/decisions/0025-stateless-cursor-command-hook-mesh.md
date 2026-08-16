# ADR 0025: Stateless Cursor command-hook mesh

## Decision

Replace the inert stop hook with the command-only v0.4.0 mesh specified in [`../specs/cursor-hook-mesh.md`](../specs/cursor-hook-mesh.md). Use one stateless dispatcher for six events. Protect writable handoffs, shell execution, and reads with fail-closed definitions; keep session, evidence reminder, and compaction guidance fail-open. Remove stop and defer generic preToolUse, prompt hooks, MCP hooks, and all other lifecycle surfaces.

## Rationale

Cursor already owns runtime state and native permission decisions. A narrow command mesh can validate handoff shape plus exact official `subagent_type`/declared-role identity, request approval for enumerated consequential commands, deny exact transcript-path access, and remind the parent to reconcile evidence without inventing a second runtime. Mixed failure posture preserves protected boundaries while avoiding guidance-hook outages blocking work. Protected raw discriminator contradictions fail conservatively; malformed guidance remains inert.

## Consequences

The shell screen is direct-form token/pattern classification and intentionally incomplete. Its normative class and boundary matrix is in the specification; it makes no shell-parsing or obfuscation-resistance claim and never rewrites commands. Handoff validation proves shape and declared/runtime name equality only. The evidence hook neither reads output nor decides PASS/FAIL/MISSING. Compaction guidance supports manual reconstruction but does not restore state. No hook parses transcripts, persists data, starts services, schedules work, controls MCP, or follows up automatically.
