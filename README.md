# Curiosity Cursor Plugin

Private plugin foundation with an additive, locally loaded native Cursor advisory surface and the existing OpenCode research assets.

## Current boundary

Retained and verified:

- bundled agent definitions and default orchestrator routing;
- prompt/resource skills for bounded curiosity, deep research, competitive analysis, reverse engineering, review, verification, and handoff compilation;
- `/bug`, `/feature`, `/secure`, and `/research` engineering guidance;
- the handoff compiler and its fixtures/tests;
- generic redacted event/tool capture under `.opencode/curiosity-cursor-plugin/capture/v1/`;
- pure Ledger domain/archive primitives and focused tests;
- provenance, attribution, and reproducible asset manifests;
- temporary `/loop-*` command-name compatibility aliases.
- a native Cursor Plugin manifest exposing four read-only advisors plus bounded writable worker and implementer subagents;
- `/curiosity-engineering <explore|propose|apply|update|status|verify|finish>`, a model-eligible skill for a risk-scaled native change contract, Agent Todos, bounded Tasks, evidence, and user-confirmed finish;
- one stateless command-hook dispatcher for session guidance, marked writable handoffs, bounded shell/read permission decisions, evidence reminders, and pre-compaction guidance.

Not shipped:

- native loop execution, continuation, lifecycle, or tools;
- Ledger lifecycle authority, runtime hooks, or tools;
- graph, Beads, or OpenSpec engines;
- experimental typed engineering admission/controllers, external records, or local effects;
- stop/subagentStop, generic preToolUse, MCP, prompt, thought/response, specialized after, Tab, sessionEnd, or workspaceOpen hooks; MCP servers, rules, commands, variables, installation, or marketplace distribution;
- automatic workflow continuation, plugin-owned lifecycle state, OpenSpec or Beads implementation, or completion authority.

Every `/loop-*` alias is markdown-only. Runtime operations return `CURIOSITY_CURSOR_COMPAT_RUNTIME_UNSUPPORTED`; compaction remains manual host guidance. The aliases are retained temporarily pending an explicit Cursor command mapping and may then be retired.

## Native Cursor local use

Actual Cursor sessions require CLI authentication (`agent login` or an API key); `agent status` reports the current account state. The CLI uses the current working directory (CWD) as its default workspace. Using this repository as that workspace can therefore load root `AGENTS.md` as a project instruction, not as a plugin component.

Keep plugin root and target workspace distinct when evaluating against another project. Cursor's current global-option help documents this option-before-prompt shape:

```sh
agent --workspace <target> --plugin-dir <plugin-root>
```

Cursor documents both global options in its [CLI parameter reference](https://cursor.com/docs/cli/reference/parameters), CWD and `AGENTS.md` behavior in [Using Agent](https://cursor.com/docs/cli/using), the manifest layout in the [plugin reference](https://cursor.com/docs/reference/plugins), and agent behavior in the [subagents reference](https://cursor.com/docs/subagents). Workspace trust may prompt; an accepted trust decision can persist. Normal Cursor account and session state can also persist. Omitting `--plugin-dir` on later invocations rolls back only invocation-scoped plugin loading; it does not clear ordinary Cursor trust, account, or session state.

Invoke an agent explicitly as `/curiosity-coordinator`, `/curiosity-worker`, `/curiosity-implementer`, `/curiosity-researcher`, `/curiosity-reviewer`, or `/curiosity-strategist`. Automatic selection is nondeterministic. `readonly: true` is Cursor's documented restriction of no file edits and no state-changing shell commands; it is not confidentiality, a no-read boundary, local-only processing, a no-network/no-MCP guarantee, or proof of prompt compliance. The worker and implementer use `readonly: false` for accepted ready Todos with exclusive ownership; that metadata does not prove prompt compliance or safe execution. Behavior depends on Cursor version, mode, tool policy, team/admin policy, and model compliance. The coordinator remains advisory and cannot guarantee Task access, delegation, or routing. The CLI surface has been mostly exercised with documented partial results; the editor remains unverified because of a systemic Accessibility failure. See the [sanitized live-smoke report](docs/research/cursor-live-smoke-2026-08-15.md). The existing OpenCode research surface coexists with this native surface and is not cut over.

Invoke one of the seven explicit workflow actions. `propose` requires user-selected Plan Mode and explicit acceptance of the lite/full contract. `apply` may delegate only accepted, ready, non-overlapping Todos. Material drift invalidates acceptance and `update` requires a revised native Plan plus renewed native Plan acceptance; ordinary chat is not reacceptance. Native Todo checkmarks and `All done` mean attempted work/progress only: observed host/model behavior can show them even when a mandatory command exits 1. The parent separately maps every mandatory requirement, scenario, and evidence command to raw PASS/FAIL/MISSING in a prompt-level Verification Gate. FAIL/MISSING keeps the gate BLOCKED/UNVERIFIED and forbids finish confirmation; user confirmation cannot waive it. Reviewer Task handoffs are bounded and return raw evidence for parent reconciliation. These are static/model-mediated contracts, not host enforcement, and cannot prevent Cursor from rendering `All done`.

The v0.4.0 [hook mesh](docs/specs/cursor-hook-mesh.md) uses exactly six command events and mixed failure posture. Writable worker/implementer Tasks use the ordered `[curiosity-handoff/v1]` contract; advisor Tasks remain unmarked. Evidence shell commands carry `[curiosity-evidence/v1] check=<slug>`, but the post hook never reads output or declares a verdict. Shell screening is an enumerated lexical approval screen, not full parsing or obfuscation resistance. Exact supplied transcript paths are denied for shell occurrence and file/attachment lexical equality; the dispatcher never opens transcripts. It owns no state, store, log, network, scheduler, daemon, MCP, continuation, or completion authority.

## Development

```sh
bun install --frozen-lockfile
bun run verify
```

The package and repository are private. Do not publish to npm or install globally from this research tree. Native 0.4.0 adds the stateless hook mesh while preserving the 0.3.2 Todo-authority correction: native Todos are progress projections and raw evidence controls the separate Verification Gate. No live model smoke was run for 0.4.0. Historical sanitized CLI evidence remains historical and does not establish current editor behavior, hook behavior, complete runtime parity, runtime conversion, or host enforcement.

## Provenance

This tree preserves MIT-licensed OpenCode Loop attribution and clean-room research provenance. See [`docs/provenance.md`](docs/provenance.md) and [`provenance/`](provenance/).
