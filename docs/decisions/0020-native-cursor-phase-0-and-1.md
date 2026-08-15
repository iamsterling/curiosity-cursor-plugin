# ADR 0020 — Native Cursor Phase 0 and Phase 1

**Accepted, 2026-08-15.** Add an additive private Cursor Plugin manifest and four read-only native agents: a clearly advisory coordinator plus research, review, and strategy specialists. The manifest names only these agents; it adds no native hooks, MCP servers, rules, commands, skills, variables, or marketplace metadata.

Cursor documents `.cursor-plugin/plugin.json`, explicit agent paths, and markdown agent frontmatter in its [plugin reference](https://cursor.com/docs/reference/plugins) and [subagents reference](https://cursor.com/docs/subagents). The native prompts adapt the reviewed OpenCode JSON definitions at repository baseline `5eff1e49852384bc87c8bc162a03927e03cb2e6e`; they do not replace or remove the existing OpenCode research surface.

Local evaluation is opt-in with `agent --plugin-dir "$PWD"`, as documented by the Cursor CLI [`--plugin-dir` parameter](https://cursor.com/docs/cli/reference/parameters). Removing that argument from subsequent invocations is the operational rollback. No installation, marketplace publication, default-agent cutover, live model smoke test, or delegation guarantee is part of this decision.
