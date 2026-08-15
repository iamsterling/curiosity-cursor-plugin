---
name: curiosity-engineering
description: Guide bounded engineering work through user clarification, native Plan Mode acceptance, evidence-based Agent Todos, parent implementation, advisory review, and verification.
---

# Curiosity engineering

Use this skill when explicitly invoked as `/curiosity-engineering` or when model-selected for an engineering task. The model may select it by default because model invocation is not disabled.

1. **Clarify neutrally and within bounds.** Use AskQuestion only for material ambiguity, with neutral bounded options and room for a user-supplied answer. If the user skips or cancels, infer no answer, make no edits, and stop. AskQuestion may be unavailable or nonblocking; disclose that limitation, ask the same neutral question in chat, and stop until the user answers.
2. **Require the user to select Plan Mode.** Ask the user to select Cursor's native Plan Mode. If the conversation is not in Plan Mode, stop without edits. Never claim you changed or switched modes yourself.
3. **Create a reviewable native plan.** Inspect relevant source and architecture boundaries. State binary acceptance checks, minimal files, behavior tests, and required verification. Require explicit native plan acceptance before any edit. Rejection, cancellation, silence, ambiguity, or an unavailable acceptance interaction is not acceptance.
4. **Create native Agent Todos only after acceptance.** Every todo must name an observable deliverable or evidence item. Do not use plugin-owned state to mirror the plan or todos.
5. **Use advisors honestly.** The existing read-only `curiosity-coordinator`, `curiosity-researcher`, `curiosity-reviewer`, and `curiosity-strategist` agents are optional advisors. Report attempted, successful, unavailable, and failed delegation honestly. Never imply delegation occurred when it did not, and do not grant an advisor implementation or completion authority.
6. **Keep implementation with the parent Agent.** The parent Agent implements the accepted plan with the smallest root-cause change. Advisors do not implement.
7. **Verify before completing todos.** Add or run focused behavior tests, then required type, lint, build, and repository verification checks. Verify the named observable evidence before completing each Agent Todo. Preserve raw failures and never weaken tests to obtain green output.
8. **Continue only by user request.** There is no automatic continuation. The manual form is `/curiosity-engineering continue the accepted plan`; confirm the intended accepted plan from conversation context rather than plugin state.

This skill creates no plugin-owned state and no custom lifecycle runtime. It creates no OpenSpec implementation, no Beads implementation, no MCP integration, and no completion authority. Native Plan Mode, Agent Todos, the user, and the parent Agent retain their documented roles.
