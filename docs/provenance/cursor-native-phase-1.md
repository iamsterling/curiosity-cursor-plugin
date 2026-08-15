# Cursor native Phase 1 provenance

The native Cursor agent adaptations were authored from repository baseline `5eff1e49852384bc87c8bc162a03927e03cb2e6e`. They preserve selected intent from reviewed in-repository OpenCode agent definitions while changing format and wording for Cursor's documented [plugin](https://cursor.com/docs/reference/plugins) and [subagent](https://cursor.com/docs/subagents) interfaces.

| Native adaptation | Reviewed in-repository source |
| --- | --- |
| `agents/curiosity-coordinator.md` | `assets/config/agents/orchestrator.json` |
| `agents/curiosity-researcher.md` | `assets/config/agents/researcher.json` |
| `agents/curiosity-reviewer.md` | `assets/config/agents/reviewer.json` |
| `agents/curiosity-strategist.md` | `assets/config/agents/strategist.json` |

These adaptations are not verbatim upstream imports. They add Cursor-native frontmatter, collision-resistant names, explicit read-only and non-implementation boundaries, and capability caveats. The coordinator's advisory limitation replaces the OpenCode definition's primary-agent and routing assumptions; no Cursor Task availability, delegation, or routing outcome is asserted. The original MIT attribution and import history remain in `provenance/` and [`docs/provenance.md`](../provenance.md).
