# Repository Constitution

This private repository contains `@iamsterling/curiosity-cursor-plugin`, a research-phase plugin split derived from the MIT-licensed OpenCode Loop import.

- Preserve source attribution and reproducible manifests in `provenance/`.
- Runtime identity is `iamsterling.curiosity-cursor-plugin`; plugin capture state belongs under `.opencode/curiosity-cursor-plugin/`.
- The native Cursor surface is limited to a private locally loaded manifest, four read-only advisors, two bounded writable subagents, one seven-action `/curiosity-engineering` skill, and one inert stop hook; never claim broader conversion, guaranteed delegation, installation, or cutover.
- The engineering skill requires user-selected Plan Mode and explicit native plan acceptance before edits. Writable children receive only exact accepted ready Todos with exclusive ownership; the parent retains coordination/reconciliation and no agent has completion authority.
- Native Todo status/checkmarks are attempted-work projections, not evidence or completion authority. A separate prompt-level Verification Gate maps mandatory requirements, scenarios, and evidence commands to raw PASS/FAIL/MISSING results; FAIL/MISSING blocks finish confirmation regardless of `completed`, `All done`, or attempted user confirmation.
- The stop hook must remain stateless and emit `{}` for every input. `loop_limit: 5` is an upper bound, delivered automatic follow-ups remain zero, and the hook must not be counted as continuation or translated capability.
- Treat this root `AGENTS.md` as a possible Cursor workspace instruction, not as a plugin component. Keep target workspace separate from plugin root in documented invocations.
- Do not describe `readonly: true` as confidentiality, no-read, local-only, no-network/no-MCP, or proof of prompt compliance; it documents no file edits/no state-changing shell commands and remains host-policy dependent.
- Keep the completed `/loop-*` markdown aliases temporarily while explicit Cursor command mapping is undecided; they must not claim a working native loop or Ledger runtime.
- Never commit credentials, runtime state, logs, generated caches, dependencies, or global user configuration.
- Do not publish to npm, install globally, or cut over an installation from this repository without a separately reviewed change.
- Keep the native Cursor surface additive: the existing OpenCode research surface coexists and must not be removed by Cursor-only work.
- Do not add plugin-owned workflow state, transcript parsing, custom lifecycle runtime, OpenSpec/Beads assets or runtime, MCP, or automatic continuation without a separate decision.
- Use concise ADRs in `docs/decisions/` for consequential choices.
- Before behavior changes, add a failing focused test; run `bun run verify` before handoff.
