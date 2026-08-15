# 0023 — CLI-smoke guidance hardening

**Status:** Accepted, 2026-08-15.

A separate authorized CLI smoke exposed three prompt-guidance gaps: completion could proceed with failed mandatory evidence, chat could be mistaken for material-drift reacceptance, and review could seek transcript context. Version 0.3.1 therefore requires mandatory evidence to pass before completion confirmation, requires a revised native Plan and native Plan acceptance after material drift, and bounds every reviewer Task handoff to explicit artifacts while prohibiting transcript/session-state retrieval.

These are checked-in prompt and test-fixture contracts only. They do not claim Cursor host enforcement or model compliance, add runtime/state, change the inert hook, or run a live model in this change. Rollback reverts the 0.3.1 guidance, fixtures, and version bump.
