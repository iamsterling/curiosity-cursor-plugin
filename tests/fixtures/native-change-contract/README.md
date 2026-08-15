# Native change-contract fixtures

These fixtures exercise the test-only projection validator in `tests/support/native-change-contract-validator.mjs`. Valid fixtures contain all eleven documented contract sections. Invalid fixtures name a valid base and replace only the state needed to violate one invariant. They prove only that documented contract shapes and invariants are deterministically accepted or rejected. They do not execute the skill, create runtime authority, or prove Cursor/model compliance.
