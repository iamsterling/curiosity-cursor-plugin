# Current state

**Current (2026-08-15).** `iamsterling.curiosity-cursor-plugin` contains a research-phase OpenCode plugin foundation plus an additive native Cursor Phase 0 and Phase 1 surface. One OpenCode `Plugin.define` composes completed bundled-agent routing with generic redacted tool/event capture. Capture state is project-scoped under `.opencode/curiosity-cursor-plugin/capture/v1/`.

Completed prompt/resource capabilities remain: bounded curiosity and research assets, competitive and reverse-engineering guidance, handoff compilation, review/verification skills, and thin `/bug`, `/feature`, `/secure`, and `/research` command guidance. Actual agent-based orchestration is supplied by the bundled orchestrator and specialist agent definitions.

The split deliberately does **not** ship the unfinished native loop engine, Ledger lifecycle authority/runtime hooks/tools, graph proposal, typed engineering admission/controller scaffolding, external-record planning, local effects, or an orchestration feature stub. Pure Ledger domain decoding/delta/dependency/replay functions and the archive transaction primitive remain as non-runtime libraries with focused tests and preserved clean-room attribution.

All `/loop-*` files remain temporary markdown compatibility aliases. They expose no scheduler, continuation, lifecycle, status, pause, resume, stop, progress, or completion runtime. Runtime requests fail closed with `CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED`; host compaction guidance remains manual.

The native Cursor boundary is `.cursor-plugin/plugin.json` and exactly four explicitly listed read-only markdown agents under `agents/`: coordinator, researcher, reviewer, and strategist. The coordinator is advisory rather than a default/primary agent and makes no Task-access, delegation, or routing guarantee. There are no native hooks, MCP servers, rules, commands, skills, variables, lifecycle runtime, installation, or marketplace metadata. Cursor's [plugin reference](https://cursor.com/docs/reference/plugins) and [subagents reference](https://cursor.com/docs/subagents) define the adopted file formats.

The Cursor and OpenCode surfaces coexist; no cutover occurred. Broader native APIs, command mapping, packaging, and installation remain pending.

Actual Cursor sessions require CLI authentication. CWD is the default workspace; selecting this repository as workspace may load root `AGENTS.md` as a project instruction. For another project, keep the boundaries explicit with the currently documented global-option shape `agent --workspace <target> --plugin-dir <plugin-root>`. Workspace trust may prompt and accepted trust can persist; normal Cursor account/session state may persist. Omitting `--plugin-dir` rolls back plugin loading only, not ordinary Cursor state.

The explicit agents are `/curiosity-coordinator`, `/curiosity-researcher`, `/curiosity-reviewer`, and `/curiosity-strategist`; automatic selection is nondeterministic. `readonly: true` means documented no file edits and no state-changing shell commands. It is not confidentiality, no-read, local-only processing, no-network/no-MCP guarantee, or proof of prompt compliance, and depends on version, mode, policy, and admin controls. No live Cursor/model smoke test is claimed.
