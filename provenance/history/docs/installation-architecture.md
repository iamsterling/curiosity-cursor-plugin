# Installation architecture

No installation cutover is part of this repository. The inherited OpenCode installer implementation is tested, but this repository does not run it against operator configuration.

Actual Cursor sessions require CLI authentication. The CLI defaults its workspace to the current working directory (CWD), and a workspace rooted at this plugin repository may load root `AGENTS.md` as a project instruction. For a target project, keep workspace and plugin root distinct; current Cursor global-option help documents:

```sh
agent --workspace <target> --plugin-dir <plugin-root>
```

The options are documented in Cursor's [CLI parameter reference](https://cursor.com/docs/cli/reference/parameters); CWD and project instructions are documented in [Using Agent](https://cursor.com/docs/cli/using). Workspace trust may prompt, and accepted trust can persist. Ordinary Cursor account and session state may persist too. Omitting `--plugin-dir` rolls back plugin loading only; it does not erase those ordinary Cursor states. This path does not copy plugin files, install the plugin, or establish persistent duplicate-load prevention.

Explicit invocation names are `/curiosity-researcher`, `/curiosity-reviewer`, `/curiosity-strategist`, and the sole command `/curiosity-deliver-change`; automatic selection is nondeterministic. The main Agent is sole editor, built-in Explore handles discovery, and consequential changes use user-selected Plan Mode. The installed surface has no hook, MCP, executable asset, external runtime, or installer. Cursor documents `readonly: true` as no file edits and no state-changing shell commands. It is not confidentiality, no-read, local-only processing, no-network/no-MCP guarantee, or proof of prompt compliance; behavior is version-, mode-, tool-policy-, and admin-policy-dependent. Historical invocation-scoped Cursor CLI live smokes ran in disposable repositories. The editor runtime remains unverified because Accessibility blocked testing, and live behavior remains version-, model-, and mode-dependent.

A future separately reviewed Cursor design must define packaging, integrity, placement, duplicate-load prevention, rollback beyond invocation scope, and any migration policy. Until then:

- the current OpenCode research plugin emits only redacted capture state under `.opencode/curiosity-cursor-plugin/capture/v1/`;
- old `.opencode/opencode-loop/` and `.opencode/opencode2-config/` state is read by neither runtime nor bootstrap tooling;
- global configuration and installed plugins remain untouched;
- the existing OpenCode research surface coexists and is not cut over;
- no Cursor installation, marketplace publication, or conversion beyond the three agents, one skill, one command, and one rule is claimed. Static validation is declaration evidence; editor behavior, current model availability, fallback, reviewer resumption, and complete runtime parity remain unverified.
