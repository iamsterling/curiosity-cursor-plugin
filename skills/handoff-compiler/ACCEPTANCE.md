# Stage-2 acceptance contract

- `handoff-contract/v1` accepts bounded, omit-empty contract proposals and rejects any other version.
- Exclusive writable artifacts have one owner; dependency graphs are acyclic; parallel representation requires caller authorization.
- Context has locator, provenance, freshness, and supported treatment; criteria name observable oracles and suitable evidence kinds.
- Policy denial and blocking ambiguity return stable terminal diagnostics without a contract proposal.
- The command and skill are planning-only and contain no routing, state, completion, provider-default, or repository-specific execution behavior.
- Canonical serialization is deterministic regardless of input key order.

Non-goals: execution control, persistence, worker selection, lifecycle authority, semantic judgment, and workflow ownership.
