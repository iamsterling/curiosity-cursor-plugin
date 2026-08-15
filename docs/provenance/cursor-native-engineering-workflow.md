# Cursor-native engineering workflow provenance

**Authored:** 2026-08-15 at repository baseline `c4ac45fb8bbe2fc5092e92703963d44322a6aad0`.

This slice is original repository work rather than a verbatim upstream import. Its native formats and limitations were derived from these primary official Cursor sources:

- [Plugin reference](https://cursor.com/docs/reference/plugins) and the pinned schema recorded in `provenance/cursor/README.md`;
- [Agent Skills](https://cursor.com/docs/skills), including skill discovery, explicit slash invocation, model selection, and `disable-model-invocation`;
- [Plan Mode](https://cursor.com/docs/agent/plan-mode), including user mode selection and native plan review;
- [Hooks](https://cursor.com/docs/hooks), including `stop`, `status`, `loop_count`, `followup_message`, `loop_limit`, and `failClosed`;
- [Subagents](https://cursor.com/docs/subagents) for the advisory-agent surface;
- CLI [Using Agent](https://cursor.com/docs/cli/using) and [parameters](https://cursor.com/docs/cli/reference/parameters) for local invocation boundaries.

The custom specification adapts discipline studied from Fission-AI/OpenSpec v1.8.0 at commit `d57889664cab4f2f061d236ec3ff82a5578701bb` and dependency/readiness concepts studied from `gastownhall/beads` v1.1.0 at commit `8e4e59d39f3459a43cf21a3236a13eca4dd874f7`. The exact official source files, immutable raw URLs, 2026-08-15 retrieval date, and mechanically checked SHA-256 digests are recorded in [`../../provenance/cursor/native-change-contract-sources.json`](../../provenance/cursor/native-change-contract-sources.json). It is explicitly not compatible with OpenSpec or Beads and includes neither source's assets, commands, IDs, formats, runtime, storage, graph, scheduler, service, claims/leases, sync/federation, or archive. No upstream source text was copied; no external runtime, dependency, or asset ships. It also includes no MCP, cloud agent, credentials, plugin workflow state, installation, or publication.

No live Cursor/model smoke was run. Tests validate the checked-in manifest against Cursor's pinned official schema, parse six agents and the skill, validate fixture projections of the documented change-contract invariants, statically inspect semantic prompt contracts, and execute the inert hook under synthetic documented and malformed inputs. The fixture validator is test-only: it proves contract shape, not Cursor/model compliance or runtime authority. Therefore actual Cursor discovery, model selection, AskQuestion availability, Plan Mode UX, plan acceptance UX, Agent Todos, Task/delegation, session restoration, prompt compliance, hook host behavior, and version compatibility remain runtime unknowns. Common stop fields (`conversation_id`, `generation_id`, `workspace_roots`, `transcript_path`) do not establish Plan/Todo correlation; transcript parsing is prohibited and the hook is not counted as translated behavior.
