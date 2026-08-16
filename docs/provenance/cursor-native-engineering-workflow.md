# Cursor-native engineering workflow provenance

**Authored:** 2026-08-15 at repository baseline `c4ac45fb8bbe2fc5092e92703963d44322a6aad0`.

This slice is original repository work rather than a verbatim upstream import. Its native formats and limitations were derived from these primary official Cursor sources:

- [Plugin reference](https://cursor.com/docs/reference/plugins) and the pinned schema recorded in `provenance/cursor/README.md`;
- [Agent Skills](https://cursor.com/docs/skills), including skill discovery, explicit slash invocation, model selection, and `disable-model-invocation`;
- [Plan Mode](https://cursor.com/docs/agent/plan-mode), including user mode selection and native plan review;
- [Hooks](https://cursor.com/docs/hooks), including command stdio, event input/output, matchers, timeout, `failClosed`, and permission decisions;
- [Subagents](https://cursor.com/docs/subagents) for the advisory-agent surface;
- CLI [Using Agent](https://cursor.com/docs/cli/using) and [parameters](https://cursor.com/docs/cli/reference/parameters) for local invocation boundaries.

The custom specification adapts discipline studied from Fission-AI/OpenSpec v1.8.0 at commit `d57889664cab4f2f061d236ec3ff82a5578701bb` and dependency/readiness concepts studied from `gastownhall/beads` v1.1.0 at commit `8e4e59d39f3459a43cf21a3236a13eca4dd874f7`. The exact official source files, immutable raw URLs, 2026-08-15 retrieval date, and mechanically checked SHA-256 digests are recorded in [`../../provenance/cursor/native-change-contract-sources.json`](../../provenance/cursor/native-change-contract-sources.json). It is explicitly not compatible with OpenSpec or Beads and includes neither source's assets, commands, IDs, formats, runtime, storage, graph, scheduler, service, claims/leases, sync/federation, or archive. No upstream source text was copied; no external runtime, dependency, or asset ships. It also includes no MCP, cloud agent, credentials, plugin workflow state, installation, or publication.

No live Cursor/model smoke was run for the original 0.3.0 slice. A separate authorized CLI smoke informed 0.3.1. Later live CLI evidence established a sharper host limitation: Cursor marked an evidence Todo completed and rendered `To-do All done` after its mandatory full suite exited 1. Version 0.3.2 therefore treated native Todos only as attempted-work/progress projections and added a separate prompt-level Verification Gate over raw requirement, scenario, and command results. Version 0.4.0 replaces the inert stop hook with the stateless mesh in [`../specs/cursor-hook-mesh.md`](../specs/cursor-hook-mesh.md); no live model smoke was run for that mesh. Its official documentation response-byte digests are independently recorded in [`../../provenance/cursor/hook-mesh-official-docs.json`](../../provenance/cursor/hook-mesh-official-docs.json). Fixtures prove only bounded dispatcher behavior, not host loading, model compliance, or runtime authority. Transcript parsing and plugin state/store/runtime remain prohibited.
