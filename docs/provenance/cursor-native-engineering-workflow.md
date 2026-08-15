# Cursor-native engineering workflow provenance

**Authored:** 2026-08-15 at repository baseline `c4ac45fb8bbe2fc5092e92703963d44322a6aad0`.

This slice is original repository work rather than a verbatim upstream import. Its native formats and limitations were derived from these primary official Cursor sources:

- [Plugin reference](https://cursor.com/docs/reference/plugins) and the pinned schema recorded in `provenance/cursor/README.md`;
- [Agent Skills](https://cursor.com/docs/skills), including skill discovery, explicit slash invocation, model selection, and `disable-model-invocation`;
- [Plan Mode](https://cursor.com/docs/agent/plan-mode), including user mode selection and native plan review;
- [Hooks](https://cursor.com/docs/hooks), including `stop`, `status`, `loop_count`, `followup_message`, `loop_limit`, and `failClosed`;
- [Subagents](https://cursor.com/docs/subagents) for the advisory-agent surface;
- CLI [Using Agent](https://cursor.com/docs/cli/using) and [parameters](https://cursor.com/docs/cli/reference/parameters) for local invocation boundaries.

The custom specification adapts discipline studied from Fission-AI/OpenSpec and dependency/readiness concepts studied from `gastownhall/beads` v1.1.0. It is explicitly not compatible with OpenSpec or Beads and includes neither source's assets, commands, IDs, formats, runtime, storage, graph, scheduler, service, claims/leases, sync/federation, or archive. It also includes no MCP, cloud agent, credentials, plugin workflow state, installation, or publication.

No live Cursor/model smoke was run. Tests validate the checked-in manifest against Cursor's pinned official schema, parse six agents and the skill, statically inspect semantic prompt contracts, and execute the inert hook under synthetic documented and malformed inputs. Therefore actual Cursor discovery, model selection, AskQuestion availability, Plan Mode UX, plan acceptance UX, Agent Todos, Task/delegation, session restoration, prompt compliance, hook host behavior, and version compatibility remain runtime unknowns. Common stop fields (`conversation_id`, `generation_id`, `workspace_roots`, `transcript_path`) do not establish Plan/Todo correlation; transcript parsing is prohibited and the hook is not counted as translated behavior.
