# Cursor-native engineering workflow specification

**Status:** Accepted for the first pursuit slice, 2026-08-15.
**Decision:** Add one model-eligible native Cursor skill and one inert native stop hook. This specification is inspired by OpenSpec's discipline, but it is a custom native specification: it is **not OpenSpec-compatible**, creates no OpenSpec assets, and implements no OpenSpec runtime.

## Binary outcome

The slice succeeds only when Cursor can discover `/curiosity-engineering`, the skill describes the user-controlled planning and implementation protocol below, and the sole stop hook returns exactly `{}` without initiating another turn. Anything that claims automatic iteration, lifecycle authority, or durable workflow state fails this outcome.

## Scope

- A root skill at `skills/curiosity-engineering/SKILL.md`, explicitly listed by the plugin manifest and eligible for both `/curiosity-engineering` and model-selected activation.
- A native `hooks/hooks.json` with exactly one `stop` command hook and a stateless `hooks/curiosity-stop.mjs` implementation.
- Manifest, tests, architecture documentation, decision record, and provenance for those two components.
- Continued availability of the four existing read-only `curiosity-*` advisory agents.

## Exclusions

This slice adds no command, rule, MCP server, variable, marketplace configuration, cloud agent, installation, publication, credentials, live Cursor/model smoke, custom lifecycle engine, plugin-owned workflow state, transcript parser, OpenSpec implementation, or Beads implementation. It does not grant the plugin completion authority. Existing OpenCode runtime and capture behavior are not changed.

## Activation and workflow

1. **Activate.** The user may invoke `/curiosity-engineering`, or Cursor's model may select the skill when its description matches an engineering task. Activation does not create plugin-owned state.
2. **Clarify.** Ask neutral, bounded questions through AskQuestion when material ambiguity exists. Do not steer the answer. If the user skips or cancels, infer nothing and make no edits. AskQuestion may be unavailable or nonblocking; in that case ask plainly, disclose the limitation, and stop until the user supplies an answer.
3. **Select Plan Mode.** Ask the user to select Cursor's native Plan Mode. The agent must stop if the conversation is not in Plan Mode and must never claim it switched modes itself.
4. **Propose.** In Plan Mode, inspect relevant source and architecture boundaries and create a native reviewable plan with binary acceptance checks and verification commands.
5. **Accept.** Require explicit acceptance through Cursor's native plan review before any edit. Rejection, cancellation, silence, or an unavailable/nonblocking acceptance interaction is not acceptance and permits no edit.
6. **Create Agent Todos.** Only after acceptance, create native Agent Todos. Each todo names an observable deliverable or evidence item rather than private reasoning.
7. **Advise.** The parent Agent may ask `curiosity-coordinator`, `curiosity-researcher`, `curiosity-reviewer`, or `curiosity-strategist` for read-only advice. Delegation is optional and host-dependent. Report attempted, successful, unavailable, and failed delegation honestly; never imply it occurred when it did not.
8. **Implement.** The parent Agent, not an advisory subagent or plugin runtime, performs the accepted edits with minimal scope.
9. **Verify.** Run focused behavior tests first, then repository-required type, lint, build, and verification checks. Do not mark a todo complete until its named evidence exists. Report failures without weakening tests or inventing success.
10. **Continue manually.** If work stops, the supported continuation form is `/curiosity-engineering continue the accepted plan`. The user remains responsible for supplying that message and for confirming which plan is meant.

## Authority

The user's latest explicit instructions and accepted native plan govern implementation. Repository instructions and safety boundaries remain binding. Native Agent Todos communicate progress but do not supersede the accepted plan. Advisory agents provide evidence and criticism only. The parent Agent owns edits and verification. The plugin, skill, hook, and advisors have no independent completion or lifecycle authority.

## Invariants

- No edit occurs before explicit native plan acceptance.
- Skip, cancel, rejection, silence, unavailable interaction, and ambiguous response never become inferred consent.
- The parent Agent performs implementation and owns truthful reporting.
- Advisory agents remain read-only and do not gain completion authority.
- Verification precedes todo completion.
- No plugin-owned workflow/session state, store, cache, lease, or transcript interpretation is introduced.
- No OpenSpec, Beads, MCP, cloud, installation, publication, or custom lifecycle runtime is introduced.
- The existing OpenCode and four-agent Cursor surfaces coexist.

## Continuation and inert hook contract

Cursor's documented `stop` input exposes status and `loop_count`, but it cannot identify skill activation, accepted plan identity, current Agent Todos, or a final structured response. The script therefore performs **zero automatic follow-ups**. For every input—including completed, aborted, error, unknown, malformed, empty, missing fields, wrong field types, extra fields, and the configured cap—it exits successfully and writes one parseable `{}` to stdout with no stderr output.

The hook configuration uses `loop_limit: 5`, a finite per-script upper bound required by the approved surface. Because the script never emits `followup_message`, five is only an upper bound; this slice delivers **zero iterations**. The script is one bounded stdin JSON invocation with no filesystem, network, child-process, worker, timer, watcher, server, transcript, persistence, background, credential, or secret behavior. `failClosed: false` preserves Cursor's documented fail-open posture for this inert hook.

## Failure matrix

| Condition | Required result |
| --- | --- |
| AskQuestion skipped or cancelled | Infer no answer; make no edits; stop for user input. |
| AskQuestion unavailable or nonblocking | State the limitation, ask neutrally in chat, and stop. |
| User does not select Plan Mode | Do not claim a mode change; stop without edits. |
| Plan rejected, cancelled, silent, or ambiguous | No Agent Todos for implementation and no edits. |
| Advisory delegation unavailable or fails | Parent reports it honestly and either proceeds with bounded local evidence or stops if material. |
| Verification fails | Keep affected todo incomplete and report raw failure evidence. |
| Stop input is any documented status | Exit 0 and output exactly `{}`. |
| Stop input is malformed, empty, unknown, missing, wrong-typed, or extra | Exit 0 and output exactly `{}` without diagnostics or side effects. |
| `loop_count` is 0, 4, 5, or outside expectation | Same inert `{}` result; no automatic continuation. |

## Acceptance checks

- The pinned official Cursor plugin schema accepts the manifest; its explicit component allowlist is exactly agents, skill, and hook, and every path is safe and present.
- Skill frontmatter parses as duplicate-key-rejecting YAML, contains only `name` and `description`, names its folder, and omits `disable-model-invocation` so model selection remains eligible.
- The skill body contains the complete clarification, Plan Mode, acceptance, Agent Todos, advisory, parent implementation, cancellation/degradation, verification, no-runtime, and manual-continuation contract.
- Hook configuration is version 1 with exactly one `stop` command, `loop_limit: 5`, and `failClosed: false`; the limit is never `null`.
- Subprocess fixtures cover all failure-matrix inputs with a fixed timeout, exact `{}` JSON stdout, empty stderr, status 0, no `followup_message`, and no file changes.
- A scoped code scan rejects shadow runtime capabilities while documentation remains free to explain exclusions.
- Root commands, rules, `mcp.json`, root `SKILL.md`, and marketplace configuration remain absent.
- No runtime state, logs, caches, dependencies, or credentials become tracked.

## Tasks

1. Record this custom specification before behavior or component edits.
2. Add focused tests and capture genuine failure while the approved skill, hook, and manifest fields are absent.
3. Add the skill and inert hook with the smallest native surface.
4. Update the manifest to 0.2.0 and synchronize package metadata if the package version changes.
5. Add ADR/provenance and update boundary documentation without rewriting ADR 0020 history.
6. Run focused green tests and `bun run verify`; fix only regressions caused by this slice.
7. Commit and push the reviewed result. Do not install or publish it.

## Rollout and rollback

Rollout is source-only: commit and push the private plugin tree. No installation or live model invocation is authorized. A future operator may locally load the plugin through Cursor's documented `--plugin-dir` flow after separate review. Rollback removes the `skills` and `hooks` manifest entries plus their directories and reverts the 0.2.0 documentation; omitting `--plugin-dir` stops invocation-scoped loading but does not erase ordinary Cursor trust, account, or session state.

## Deferred decisions

- Whether Cursor will expose a documented correlation signal joining skill activation, accepted plan, current Todos, and final structured output.
- Whether any safe automatic continuation should be designed after that signal exists.
- Actual OpenSpec or Beads adoption, MCP integration, cloud operation, installation packaging, marketplace distribution, commands/rules, and lifecycle state.
- Live Cursor/model behavior, version compatibility, tool availability, delegation reliability, and native UI semantics.

## Primary official sources

- Cursor [Plugin reference](https://cursor.com/docs/reference/plugins) and pinned upstream plugin schema in `provenance/cursor/`.
- Cursor [Agent Skills](https://cursor.com/docs/skills) for discovery, `SKILL.md`, slash invocation, and model-selected invocation.
- Cursor [Plan Mode](https://cursor.com/docs/agent/plan-mode) for user mode selection and reviewable plans.
- Cursor [Hooks](https://cursor.com/docs/hooks) for `stop`, `followup_message`, `loop_count`, `loop_limit`, and `failClosed`.
- Cursor [Subagents](https://cursor.com/docs/subagents) for advisory agent boundaries.
- Cursor CLI [Using Agent](https://cursor.com/docs/cli/using) and [parameters](https://cursor.com/docs/cli/reference/parameters) for modes, CWD, authentication context, and local plugin loading.
