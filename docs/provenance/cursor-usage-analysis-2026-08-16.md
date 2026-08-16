# Sanitized Cursor bundle evidence and research

**Access and analysis date:** 2026-08-16. This record contains aggregates and public references only; it excludes prompts, secrets, sensitive filesystem locations, session identifiers, and transcripts.

## Empirical evidence

A read-only aggregate OpenCode V2 API scan covered 2026-07-06 18:23 UTC through 2026-08-16 06:13 UTC: **3,489 sessions**, including **343 root sessions** and **3,146 child sessions**. Of those sessions, 3,326 had projected messages and 163 did not. The projection contained 21,366 messages (3,528 user, 17,749 assistant, and 89 other message types) and 41,235 unique tool-call IDs. Message-page retrieval had zero final failures after adaptive pagination.

Child-agent ranking uses all 3,146 unique child sessions as its denominator:

| Rank | Agent | Count | Share |
| ---: | --- | ---: | ---: |
| 1 | general | 1,671 | 53.1% |
| 2 | explore | 725 | 23.0% |
| 3 | reviewer | 165 | 5.2% |
| 4 | generalist | 90 | 2.9% |
| 5 | implementer | 89 | 2.8% |
| 6 | strategist | 80 | 2.5% |
| 7 | researcher | 48 | 1.5% |
| 8 | Loom | 42 | 1.3% |
| 9 | Loom Agent | 38 | 1.2% |
| 10 | aidlc-developer-agent | 37 | 1.2% |
| 11 | worker | 36 | 1.1% |
| 12 | analyst | 21 | 0.7% |

The remaining 104 child sessions are the other-agent bucket. Stored identifiers, including case variants, were not merged without authoritative identity evidence.

Skill ranking uses 555 unique completed assistant `skill` tool calls as its denominator. Current `id` and legacy `name` inputs were normalized to the recorded skill identifier; ambient availability was not counted as use.

| Rank | Skill | Count | Share |
| ---: | --- | ---: | ---: |
| 1 | review | 132 | 23.8% |
| 2 | software-architecture | 116 | 20.9% |
| 3 | deep-research | 34 | 6.1% |
| 4 | dokploy-api-mcp | 28 | 5.0% |
| 5 | orca-cli | 26 | 4.7% |
| 6 | software-security | 23 | 4.1% |
| 7 | computer-use | 23 | 4.1% |
| 8 | verify | 21 | 3.8% |
| 9 | openspec-apply-change | 18 | 3.2% |
| 10 | orchestration | 17 | 3.1% |
| 11 | opencode | 17 | 3.1% |
| 12 | prior-art-search | 13 | 2.3% |
| 13 | customize-opencode | 11 | 2.0% |
| 14 | aidlc | 9 | 1.6% |
| 15 | reverse-engineering | 8 | 1.4% |
| 16 | openspec-update-change | 8 | 1.4% |

The remaining 51 calls are the other-skill bucket.

The dominant observed workflow motif was **discover/search/read → edit/patch → project checks → independent review**.

## Reproduction method and counting rules

Only the official OpenCode V2 CLI/API client and read-only commands or `GET` endpoints were used:

```text
opencode2 --version
opencode2 service status
opencode2 api get /api/health
opencode2 api get /openapi.json
opencode2 api get /api/session?order=asc&limit=100[&cursor=…]
opencode2 api get /api/session/{sessionID}/message?order=asc&limit={20|5|1}[&cursor=…]
opencode2 api get /api/agent
opencode2 api get /api/skill
opencode2 api get /api/command
opencode2 api get /api/plugin
```

Session pages were read oldest-first at limit 100, following each opaque `cursor.next` until absent. Message projections were also read oldest-first; a page that exceeded CLI output capacity was retried at adaptive limits 20, then 5, then 1, while preserving cursor order. Session records were de-duplicated by session ID. A record with `parentID` counted once as a child; one without it counted once as a root. Tool calls were de-duplicated by tool-call ID. Skill counts include unique completed assistant `skill` calls only, using `id` when present and otherwise the legacy `name`; configuration/catalog entries do not count as activations.

Percentages are rounded to one decimal place from the stated denominator. Child-agent shares divide by 3,146 child sessions, not all sessions or visible delegation calls. Skill shares divide by 555 skill calls, not sessions. Root plus child counts must equal all sessions; message-type counts and with/without-message counts must likewise reconcile to their totals.

The scan excluded workspace, directory, and project filters so all sessions returned by the service were eligible. It did not retain tool results, file content, prompt or transcript content, secrets, credentials, authorization data, sensitive filesystem paths, or record identifiers. The only content classification was whether a user message began with a slash-command token; that projection was insufficient for a reliable command ranking and is not in the aggregate artifact.

This was a non-transactional snapshot of a live service: the observed session total increased during collection. The APIs do not explain the 163 sessions without projected messages. Historical child creation mechanisms cannot be reconciled exactly with visible delegation calls. Command-usage limitations prevent treating slash-command absence or presence as complete workflow measurement. Counts measure frequency, not causal value, prompt compliance, outcome quality, or applicability to every Cursor team.

## Sanitized aggregate artifact

[`evidence/cursor-usage-aggregate-2026-08-16.json`](evidence/cursor-usage-aggregate-2026-08-16.json) contains only the date range, aggregate counts, rankings, and method metadata. Its SHA-256 is `7711848c41916b6e5648995bfc51aa397546491b24865fc9ccdbe7b979cb8e66`. Repository unit tests recompute this digest, reconcile every total and denominator, recompute displayed shares, verify ranking transcription into this document, and reject record identifiers, sensitive absolute paths, and authorization material.

## External guidance (primary sources)

All references accessed 2026-08-16:

- Cursor, [Plugins](https://cursor.com/docs/plugins), [Subagents](https://cursor.com/docs/agent/subagents), [Rules](https://cursor.com/docs/context/rules), [Skills](https://cursor.com/docs/context/skills), and [Plan Mode](https://cursor.com/docs/agent/plan-mode): native component and workflow capabilities.
- Google Engineering Practices, [How to do a code review](https://google.github.io/eng-practices/review/reviewer/): independent review priorities and actionable findings.
- SEI, [Architecture Tradeoff Analysis Method](https://www.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/): quality scenarios and trade-off analysis.
- NIST SP 800-218, [Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final): risk-based secure development and verification practices.
- OWASP, [Threat Modeling](https://owasp.org/www-community/Threat_Modeling) and [Application Security Verification Standard 5.0](https://owasp.org/www-project-application-security-verification-standard/): risk-triggered security review structure.
- National Academies, [Reproducibility and Replicability in Science](https://nap.nationalacademies.org/catalog/25303/reproducibility-and-replicability-in-science): traceable evidence, transparency, and limitations.

## Inference and decision

Cursor already supplies the high-frequency general editing and Explore discovery functions, and Plan Mode supplies consequential planning. The empirical distribution therefore supports removing custom parity roles rather than reproducing them. Lower-frequency but differentiated strategy, independent review, and research justify three selective read-only specialists. Frequent review/architecture use and the dominant motif justify one implementation-discipline skill, one explicit delivery command, and an always-applied evidence/authority rule.

This is an inference, not proof that three agents are universally optimal. Revisit if sanitized usage, Cursor native capabilities, or host reliability materially changes.
