# Architecture

The current composition root retains completed agent routing and generic redacted capture only. Prompt/resource assets and the handoff compiler remain distribution resources; pure Ledger domain/archive modules remain non-runtime libraries.

The native side adds a seven-action user-controlled engineering skill, four read-only advisors, two bounded writable subagents, and one inert stateless stop hook, but no automatic continuation or lifecycle authority. The hook is not translated capability. Unfinished loop, typed engineering effects, external records, local effects, and graph proposals remain excluded. See [`current-state.md`](current-state.md), [ADR 0019](../decisions/0019-curiosity-research-split.md), and [ADR 0022](../decisions/0022-complete-native-feature-translation.md).
