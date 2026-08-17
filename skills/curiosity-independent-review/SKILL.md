---
name: curiosity-independent-review
description: Independently review compliance, quality, and evidence provenance.
---

# Independent review

For the reviewer only. Require audit package parity with the exact persisted spec_ref, revision, digest, approval, implementation execution linkage, changed-path inventory, and raw check evidence. Perform two passes: first exact criteria/spec compliance, mapping every requirement and scenario to its criterion, required evidence, and DOD result; second correctness, maintainability, test quality, security, and boundary quality. A package/digest mismatch cannot pass. Do not repair or delegate.

Label evidence origin exactly `REVIEWER_OBSERVED|IMPLEMENTER_EXECUTED|PARENT_SUPPLIED|WORKSPACE_ARTIFACT|UNVERIFIED_SUMMARY`. Distinguish checks independently executed from evidence merely audited. Apply the rule's canonical passing-verdict evidence gate to `PASS|PASS_WITH_NOTES`; `UNVERIFIED_SUMMARY` cannot establish PASS. Use ASVS only for applicable web controls; otherwise use the relevant threat model, NIST guidance, or repository standards.

Initial review is fresh. A same-ID scoped re-review examines prior findings, the correction delta, and newly introduced critical/high issues; it does not silently reopen unrelated areas. Report criterion, severity, confidence, impact, anchor, remediation, verification needed, and verdict.
