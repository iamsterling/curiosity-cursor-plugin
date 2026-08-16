# ADR 0029: Bounded curiosity as foundational policy

- **Status:** Accepted
- **Date:** 2026-08-16

## Context

The four-agent hierarchy already separates authority and evidence, but a generic instruction to “be curious” can produce either shallow confirmation or unbounded research. Completion needs a compact, falsifiable account of why an in-scope probe had decision value, what raw evidence changed, and what remains unknown. Missing or contradictory evidence must not be hidden by Todo state or reviewer prose.

Primary guidance supports the shape, not a universal formula: falsification requires claims to risk disconfirmation; SEI ATAM prioritizes quality scenarios and exposes risks, sensitivity points, and trade-offs; NIST AI RMF frames risk management as Govern/Map/Measure/Manage; OWASP ASVS 5.0 supplies testable security verification requirements; ACM artifact guidance distinguishes availability, functionality, and reproducibility. Together these favor value-sensitive probes, counterexamples, reproducible anchors, negative results, and explicit stopping.

## Decision

Curiosity is foundational policy across three layers: AUTHORITY, CURIOSITY, and EVIDENCE. It applies to every substantive child result, including built-in Explore. The always-applied rule is the sole canonical owner of classification, receipt shape, compactness, and gate semantics. Role prompts and the command reference it. Main rejects inadequate or contradictory receipts and resumes the same child for bounded repair; curiosity never expands handoff authority or creates an autonomous loop.

The researcher uses one explicitly local scoring heuristic to rank candidate probes. The exact scoring weights are a heuristic adaptation for this plugin, not an ATAM, NIST, OWASP, ACM, or philosophy-of-science prescription. No new specialist, skill, command, rule, runtime validator, hook, or state store is added.

## Consequences

- Decisions gain auditable negative evidence, contradiction handling, and material-unknown escalation.
- Receipts consume context, so compactness and one-probe limits are mandatory.
- Prompt conformance remains semantic rather than host-enforced; repository tests validate authored assets only.
- Review remains capped at two blocked cycles; curiosity cannot justify endless correction.

## Primary references

Accessed 2026-08-16:

- Karl Popper, *The Logic of Scientific Discovery*, publisher record: https://www.routledge.com/The-Logic-of-Scientific-Discovery/Popper/p/book/9780415278447
- Carnegie Mellon SEI, Architecture Tradeoff Analysis Method collection: https://www.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/
- NIST, AI Risk Management Framework 1.0: https://doi.org/10.6028/NIST.AI.100-1
- OWASP, Application Security Verification Standard 5.0.0: https://github.com/OWASP/ASVS/tree/v5.0.0
- ACM, Artifact Review and Badging: https://www.acm.org/publications/policies/artifact-review-and-badging-current
