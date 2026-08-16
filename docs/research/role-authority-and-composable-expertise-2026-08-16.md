# Role authority and composable expertise synthesis

**Access date:** 2026-08-16. This synthesis independently expresses concepts; no third-party prompt, code, configuration, or runtime structure is copied. Exact source references and license boundaries are in `provenance/cursor/role-skill-architecture-sources.json`.

## Evidence ledger

Here **FACT** means a directly checkable source statement, **CLAIM** means a vendor or study assertion bounded by its source and population, and **INFERENCE** means this project's reasoned design conclusion. `UNKNOWN` marks an unresolved condition rather than negative evidence.

- **FACT:** Cursor documents plugin agents, commands, skills, and rules as file-based extension surfaces. Cursor documentation also describes subagents and context isolation, but does not document a programmatic per-handoff skill attachment used by this plugin. Verdict: express REQUIRED SKILLS semantically and block honestly when unavailable.
- **VENDOR_CLAIM:** Anthropic describes context engineering as curating the smallest high-signal token set and reports benefits from separate multi-agent contexts. OpenAI describes Codex workflows built around scoped tasks and review. These are vendor practices, not universal performance proofs. Verdict: preserve parent decisions and pointers while leaving raw discovery/log history child-local.
- **ACADEMIC_FINDING:** SWE-agent reports that agent-computer interfaces materially influence coding-agent outcomes on its studied benchmark and setup. Population, model, benchmark, and implementation constrain transfer. Verdict: make handoff and evidence interfaces explicit, then evaluate locally.
- **FACT:** Google engineering and SRE guidance separates review concerns and favors evidence tied to reproducible operation. NIST SSDF provides secure-development practices; OWASP ASVS scopes web application controls. Verdict: dual-pass review, evidence-origin labels, and use ASVS only when applicable.
- **INFERENCE:** Separating authority in agents while composing methods as role-specific skills should reduce prompt duplication and prevent the implementer from silently selecting architecture. This remains a design hypothesis until live behavioral evaluation.
- **UNKNOWN:** Model fallback, actual skill discovery, inherited permissions, and prompt adherence vary with Cursor version, plan, and policy. Static repository tests cannot establish them.

## Methodological inspirations and boundaries

`obra/superpowers@b36e0829c6d0140e93cfef2ca599b1b07d4a7797` is MIT-licensed and was reviewed only for methodological themes such as disciplined debugging and verification. No prompt or code was copied.

`code-yeongyu/oh-my-openagent@3cb1d63c4592c044347b4ce5a18779d7b7f9a764` uses Sustainable Use License 1.0. Only abstract ideas about role specialization and orchestration were considered; no text, configuration, naming scheme, or runtime structure was copied.

A local architecture skill was reviewed as unpinned and redistribution-uncleared. This public record includes no absolute path or source text and does not call it redistributable. Only abstract categories—boundaries, coupling/cohesion, contracts, effects, failure behavior, test seams, reversibility, and established vocabulary—were independently re-authored.

## Caveats and negative evidence

Test-first development has substantial practitioner support and some empirical studies, but effects depend on task, team, and outcome definition; it is not proof that every RED test identifies the true root cause. Agent evaluations are sensitive to harness, model version, prompts, tool interface, and contamination. Static fixtures therefore validate contract shape only. No live Cursor smoke was run, and no source establishes that these prompt contracts are host-enforced.
