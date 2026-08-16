# Cursor live-smoke report — 2026-08-15

## Question, scope, and verdict

Question: which native Cursor workflow claims are supported by authorized live evidence, and which remain unknown?

Scope: sanitized summaries of invocation-scoped Cursor CLI exercises against synthetic disposable repositories. The baseline exercised plugin 0.3.0 at commit `52b04fde93908455eb7914a4df39c192d726bbb3`; an intermediate retest exercised plugin 0.3.1 at commit `81bb14e6dac5aa38199eb182254d2daf28ad20d6`; focused retests exercised plugin 0.3.2 at commit `2241bc9dad09607e69d436eabeda8db4adbce9ef`. The test program used Cursor CLI `2026.08.11-e8db854`; the baseline and 0.3.1 reports record that version directly, while the 0.3.2 focused retest reports do not independently repeat it. No editor interaction succeeded.

Verdict: the CLI surface was mostly exercised, with explicit partial results and one retained contradiction. The editor surface remains unverified. This is not a claim of complete runtime parity, host enforcement, deterministic model behavior, or compatibility with an unpublished Cursor parser/review process.

## Loading, trust, and boundaries

The plugin was loaded only for each invocation with `agent --plugin-dir <plugin-root> --workspace <scenario-root>`, plus recorded plan/print options. Trust was granted only to fresh synthetic disposable workspaces using the interactive trust flow or authorized `--trust`. No plugin installation, force/yolo mode, publication, commit, external service, global configuration edit, or source/plugin repository write was part of the smoke. Account, session, trust, and native Plan artifacts remain Cursor-owned state and can persist outside those disposable repositories.

All product writes and mechanical checks were confined to the named temporary scenario roots. Plugin/source cleanliness and process or terminal closure were checked by the scenario reports. The current documentation task did not run a model and did not copy raw prompts, transcripts, streams, account data, or credentials into this repository.

## Scenario matrix

| Surface | Plugin | Verdict | Sanitized observation |
| --- | --- | --- | --- |
| A discovery | 0.3.0 | **PASS** | Invocation-scoped load, skill usage, all six agents, and inert stop-hook behavior were observed. |
| B normal workflow | 0.3.0 | **PARTIAL** | Explore, clarification, accepted Plan, delegated test-first apply, verification, and finish succeeded; only native `AskQuestion` was unavailable, so chat fallback was used. |
| F failed evidence | 0.3.0 | **ORIGINAL DEFECT** | Focused evidence passed and mandatory full evidence failed, yet native Todos rendered `All done`; the workflow did preserve the failure and remain unfinished. |
| G material drift | 0.3.0 | **PASS** | Drift after acceptance blocked writes and required reacceptance. |
| H resume/status | 0.3.0 | **PASS** | Interrupt plus `--continue` reconstructed status without edits and asked on ambiguity. |
| I Plan rejection | 0.3.0 | **PASS** | Native Plan rejection/cancellation produced no repository edit. |
| J lite/headless | 0.3.0 | **PARTIAL** | The scoped edit was made, but headless shell permissions rejected verification; an independent mechanical test passed. |
| K full/reviewer | 0.3.0 | **PARTIAL** | Security workflow and reviewer ran, but the initial reviewer crossed the transcript boundary and was denied/redirected; exact Task evidence and final finish capture were incomplete. |
| F2 failed-evidence retest | 0.3.1 | **FAIL** | Focused evidence passed and mandatory full evidence exited 1; final prose said blocked/unverified, but the failed evidence Todo was marked complete and native UI rendered `To-do All done`. |
| G2/K2/C/D/E host stop | 0.3.1 | **BLOCKED** | Account usage exhaustion stopped each scenario during plan generation, before the behavior under test; no model-behavior verdict was available. |
| F3 gate retest | 0.3.2 | **PARTIAL** | Verification Gate blocked and finish override was refused after mandatory failure, but semantic native all-done state remained and the workflow did not self-flag the contradiction. |
| G2 drift retest | 0.3.2 | **PASS** | Ordinary-chat agreement did not replace renewed native Plan acceptance; no write occurred. |
| K2 reviewer retest | 0.3.2 | **PASS** | Bounded reviewer behavior was visible without a transcript-read attempt; exact Task prompt/backend telemetry remained unavailable. |
| C blocked Todo | 0.3.2 | **PASS** | Only the ready Todo ran; the blocked Todo remained pending with an exact unblock condition and no delegation. |
| D dependency transition | 0.3.2 | **PASS** | Dependent work remained blocked until observable prerequisite evidence passed, then became ready and ran serially. |
| E parallel ownership | 0.3.2 | **PASS** | Two exclusive, non-overlapping Tasks were visibly active together and parent evidence reconciliation passed. |

## Mechanical outcomes and observed primitives

Raw mechanical outcomes, summarized without transcript content:

- Baseline B: 7 tests passed, exit 0. Baseline F: focused test passed, exit 0; mandatory full suite failed one intentional sentinel, exit 1. Baseline J: 1 test passed mechanically, exit 0. Baseline K: initial command-not-found exit 127; expected red run failed; final 9 tests passed, exit 0.
- F2: focused evidence passed and the mandatory full suite exited 1; native UI nevertheless marked the failed evidence Todo complete and rendered `To-do All done`. Usage exhaustion then blocked G2, K2, C, D, and E before their behavior under test.
- F3: focused pre-fix exit 1, focused post-fix exit 0, mandatory full suite exit 1; the gate reported BLOCKED/UNVERIFIED and refused confirmation.
- K2: expected pre-fix suite exit 1; post-fix suite exit 0 with 1 pass.
- C: focused red exit 1, then focused/full green; blocked work was untouched. D: prerequisite exit 1 then 0, followed by full-suite exit 0. E: each owned Task reported red exit 1 then green exit 0; parent full suite reported 2 passes/exit 0 and `git diff --check` exit 0.
- G/G2 produced no agent product write after material drift. H and I produced no diff.

Observed CLI primitives included invocation-scoped plugin discovery, six explicit agents, native Plans and acceptance menus, native Todos and dependency/status transitions, Task/subagent delegation, interrupt/resume, per-command permission review, a saved native Plan artifact, and parallel-agent TUI state. `AskQuestion` was reported unavailable in CLI and chat fallback was used. The 0.3.1 successful run used `Auto`; a named-model probe was unavailable on the account and the backend model/version was not exposed. F3 requested `gpt-5.3-codex` and recorded runtime label `Codex 5.3 Medium`; visible selectors and labels are not complete backend-routing evidence.

## Facts, contradictions, and limitations

- **Fact:** native Todos are attempted-work/progress projections, not evidence authority. The 0.3.0 F result, 0.3.1 F2 reproduction, and 0.3.2 F3 retest all separate Todo completion from mandatory evidence.
- **Fact:** the prompt-level Verification Gate worked in F3: mandatory exit 1 yielded BLOCKED/UNVERIFIED, no confirmation request, and refusal of `confirm finish anyway`.
- **Contradiction:** all F3 native Todos, including its finish-gate Todo, were completed while the separate gate was blocked. Unlike the original visible `All done` finding, F3 exposed semantic all-done state without the literal label, and the workflow did not report the contradiction.
- **Limitation:** editor behavior remains untested. Orca reported Accessibility and Screenshots granted, but accessibility-tree acquisition failed systemically for Cursor, Finder, and System Settings. No blind coordinate action or CLI substitution was used.
- **Limitation:** `AskQuestion` editor UX is unknown. Its CLI unavailability does not establish editor behavior.
- **Limitation:** exact Task prompts, backend models, complete backend tool telemetry, and total costs were unavailable. Visible model labels are not complete routing evidence.
- **Limitation:** parallel activity was visible in the TUI, but scheduler start/end timestamps were unavailable; true scheduler-level simultaneity is not proven.
- **Limitation:** authenticated Cursor processing, retention, network, MCP, privacy, and admin-policy behavior are not established by plugin `readonly` metadata or these synthetic scenarios.

## Correction chronology

- **0.3.0 F:** mandatory evidence failed while native Todos rendered `All done`; final workflow prose preserved the failure.
- **0.3.1 F2:** reproduced the literal native `To-do All done`/failed-evidence contradiction; usage exhaustion prevented G2, K2, C, D, and E from reaching the behavior under test, and `Auto` did not expose its backend model/version.
- **0.3.2 F3:** the separate Verification Gate blocked finish and refused an override, but semantic all-done Todo state remained and was not self-flagged.

## Evidence ledger

These are local temporary evidence paths subject to cleanup. Hashes were recomputed from the report and its available manifest on 2026-08-15. The raw files are not committed here.

| Local report path | Report SHA-256 | Manifest path | Manifest SHA-256 |
| --- | --- | --- | --- |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-cli-smoke-20260815-01/REPORT.md` | `36dffe159f8d8cbcc4c7a391b7e606a55c1ff62d88985c387647934485b55e47` | `EVIDENCE-SHA256.txt` | `353915ef81948f6c72d02161f6196af982d6bf7350a201ae7d42e57f9eb6a6fe` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-cli-retest-20260815T170000Z/REPORT.md` | `b56258229cd96259e51e0a9074592b0b6c468352f121f97cd78eb9c4cb4bf182` | `MANIFEST.sha256` | `cf5fc9cdf657a0aa946cfa7732cb4a1cbd0e067b595e154c48f929bab03a14fa` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-single-F3-trusted-pPNLgP/REPORT.md` | `92150d8d3e0de33978367f5cabf78a30d669492acfe3a4c54d78e44818218378` | `evidence/SHA256SUMS` | `e80a81f3c92c15cf52be8c671dc3d446fff3d047f8b6d1a71358dedcb58762f8` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-single-G2-orca-xC4H16/report.md` | `fbeb43e3b0d6cfcb8796b32c83b88cab030043a9452ff6d9101c42d16ce6dd0b` | `hashes.sha256` | `183472f95d6458bf4458b4d6a103027d57ed9faa4a993a053c110a9f97645d06` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-single-K2-ZRHCSz/REPORT.md` | `a2a02fc97a27a5eb019cd08002a7df3dc5907b6158b21f4daa6eb21622c15356` | `evidence/SHA256SUMS` | `a3f36e2549427a40dd3a0c41b5d6e159e9e8f43b79d40bb7f65bb9cb58161121` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-single-C-7xQzbK/REPORT.md` | `3f47f5112460e2e9e6253b664a71db5565987b8e337f3ac40e9cfd0d8c990b8a` | `evidence/sha256.txt` | `a5e79715d9bea774dd53533eb54e414cfc289b40712459a261daff990c0ac7f3` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-single-D-dXlWrt/REPORT.md` | `2e0608c22723f1d62e854238f9308ae5a7c76cdc5b1df531edb8bc1013dd203d` | `evidence/sha256.txt` | `952defaf6f73483addb6bd31390278d0300b6ac36ca490a8dc9e97a8937d0bbd` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-single-E-7gWRRd/REPORT.md` | `a1f0600bedc8fc98d16053830ab4fafe1bba6edaeb73784057c01ba154bc0e83` | `evidence/sha256.txt` | `3ca291980a8f8311e75d1df57a48dade4eec074601e6d3de6c49b5000f1ef801` |
| `/private/var/folders/wr/8bsbkjgd46v11_cpt9rfqm2r0000gn/T/opencode/cursor-smoke-I8tFGh/evidence/BLOCKER.md` | `67245f69a97fd0fb36de5683f685029b79d3882ab6dd8eaf66a752197910007f` | Not available | Not available |

## Conclusions and next tests

The evidence supports invocation-scoped CLI loading and most planned workflow projections, including Plan acceptance, drift reacceptance, blocked/dependency transitions, bounded delegation, evidence reconciliation, resume, rejection, and a functioning Verification Gate. It does not make Todos authoritative, erase the F3 contradiction, or establish editor parity.

Next tests, each requiring separate authorization and fresh disposable boundaries: restore Orca Accessibility and exercise editor plugin loading plus native `AskQuestion`; capture F3 in an interactive UI to compare literal rendering with stream state; expose or independently record bounded Task inputs/tool telemetry; and collect scheduler timestamps for parallel Tasks.

## Source selection, curiosity log, and stop decision

Primary evidence was limited to the sanitized scenario reports, their hash manifests, and the editor blocker because those records directly bind verdicts, tested identities, raw exits, boundaries, and missing evidence without requiring raw transcript ingestion. Repository static claims remain documented in the companion [current-alignment audit](cursor-current-alignment-audit-2026-08-15.md).

`CURIOSITY_NO_GO`: do not infer editor behavior, confidentiality, scheduler simultaneity, hidden Task behavior, exact cost/model routing, or complete runtime parity from this CLI sample. Do not preserve raw temporary transcripts in the repository.

Stop: the authorized reports answer the bounded documentation question. Further evidence requires new live editor or model activity, which is outside this task.
