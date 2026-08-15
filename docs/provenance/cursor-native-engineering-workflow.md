# Cursor-native engineering workflow provenance

**Authored:** 2026-08-15 at repository baseline `c4ac45fb8bbe2fc5092e92703963d44322a6aad0`.

This slice is original repository work rather than a verbatim upstream import. Its native formats and limitations were derived from these primary official Cursor sources:

- [Plugin reference](https://cursor.com/docs/reference/plugins) and the pinned schema recorded in `provenance/cursor/README.md`;
- [Agent Skills](https://cursor.com/docs/skills), including skill discovery, explicit slash invocation, model selection, and `disable-model-invocation`;
- [Plan Mode](https://cursor.com/docs/agent/plan-mode), including user mode selection and native plan review;
- [Hooks](https://cursor.com/docs/hooks), including `stop`, `status`, `loop_count`, `followup_message`, `loop_limit`, and `failClosed`;
- [Subagents](https://cursor.com/docs/subagents) for the advisory-agent surface;
- CLI [Using Agent](https://cursor.com/docs/cli/using) and [parameters](https://cursor.com/docs/cli/reference/parameters) for local invocation boundaries.

The custom specification borrows only discipline from OpenSpec. It is explicitly not OpenSpec-compatible and includes no OpenSpec asset or runtime. It also includes no Beads asset/runtime, MCP, cloud agent, credentials, state, installation, or publication.

No live Cursor/model smoke was run. Tests validate the checked-in manifest against Cursor's pinned official schema, parse the skill metadata, and execute the inert hook under synthetic documented and malformed inputs. Therefore actual Cursor discovery, model selection, AskQuestion availability, Plan Mode UX, plan acceptance UX, Agent Todos, delegation, hook host behavior, and version compatibility remain runtime unknowns.
