---
name: curiosity-independent-review
description: Independently review compliance, quality, and evidence provenance.
---

# Independent review

For the reviewer only. Perform two passes: first criteria/spec compliance; second correctness, maintainability, test quality, security, and boundary quality. Do not repair or delegate.

Label evidence origin exactly `REVIEWER_OBSERVED|IMPLEMENTER_EXECUTED|PARENT_SUPPLIED|WORKSPACE_ARTIFACT|UNVERIFIED_SUMMARY`. Distinguish checks independently executed from evidence merely audited. Apply the rule's canonical passing-verdict evidence gate to `PASS|PASS_WITH_NOTES`; `UNVERIFIED_SUMMARY` cannot establish PASS. Use ASVS only for applicable web controls; otherwise use the relevant threat model, NIST guidance, or repository standards.

Initial review is fresh. A same-ID scoped re-review examines prior findings, the correction delta, and newly introduced critical/high issues; it does not silently reopen unrelated areas. Report criterion, severity, confidence, impact, anchor, remediation, verification needed, and verdict.
