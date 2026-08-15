# ADR 0021 — Native engineering workflow pursuit

**Accepted, 2026-08-15.** Add one model-eligible Cursor skill for a user-controlled engineering workflow and one inert `stop` hook. This supersedes only ADR 0020's exclusion of native skills and hooks; its agent decision, local-loading cautions, and all other exclusions remain historical and current as applicable.

The workflow uses native AskQuestion, user-selected Plan Mode, explicit native plan acceptance, and native Agent Todos before parent-Agent implementation. The four existing read-only `curiosity-*` agents may advise, but have no implementation or completion authority. Cancellation or unavailable interactions do not imply consent. The authoritative custom specification is [`../specs/cursor-native-engineering-workflow.md`](../specs/cursor-native-engineering-workflow.md). It is inspired by OpenSpec discipline but is not OpenSpec-compatible and creates no OpenSpec implementation.

Cursor's documented stop payload does not identify skill activation, accepted plan, current Todos, or a final structured response. The one hook therefore always returns `{}` and performs zero automatic follow-ups. `loop_limit: 5` is a finite upper bound for the script, not five delivered iterations. No transcript parsing, persistence, plugin-owned state, custom lifecycle runtime, OpenSpec, Beads, MCP, cloud agent, installation, publication, or live Cursor/model smoke is approved.

Rollback removes the skill and hook manifest entries and their files. The existing agents and OpenCode surface remain additive and unchanged.
