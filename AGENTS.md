# Repository Constitution

This private repository contains `@iamsterling/curiosity-cursor-plugin`, a research-phase plugin split derived from the MIT-licensed OpenCode Loop import.

- Preserve source attribution and reproducible manifests in `provenance/`.
- Runtime identity is `iamsterling.curiosity-cursor-plugin`; plugin capture state belongs under `.opencode/curiosity-cursor-plugin/`.
- The native Cursor surface is limited to a private locally loaded manifest, four read-only advisory agents, `/curiosity-engineering`, and one inert stop hook; never claim broader conversion, guaranteed delegation, installation, or cutover.
- The engineering skill requires user-selected Plan Mode and explicit native plan acceptance before edits. The parent Agent implements; advisors have no completion authority.
- The stop hook must remain stateless and emit `{}` for every input. `loop_limit: 5` is an upper bound, while delivered automatic follow-ups remain zero.
- Treat this root `AGENTS.md` as a possible Cursor workspace instruction, not as a plugin component. Keep target workspace separate from plugin root in documented invocations.
- Do not describe `readonly: true` as confidentiality, no-read, local-only, no-network/no-MCP, or proof of prompt compliance; it documents no file edits/no state-changing shell commands and remains host-policy dependent.
- Keep the completed `/loop-*` markdown aliases temporarily while explicit Cursor command mapping is undecided; they must not claim a working native loop or Ledger runtime.
- Never commit credentials, runtime state, logs, generated caches, dependencies, or global user configuration.
- Do not publish to npm, install globally, or cut over an installation from this repository without a separately reviewed change.
- Keep the native Cursor surface additive: the existing OpenCode research surface coexists and must not be removed by Cursor-only work.
- Do not add plugin-owned workflow state, transcript parsing, custom lifecycle runtime, OpenSpec/Beads assets or runtime, MCP, or automatic continuation without a separate decision.
- Use concise ADRs in `docs/decisions/` for consequential choices.
- Before behavior changes, add a failing focused test; run `bun run verify` before handoff.
