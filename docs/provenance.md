# Provenance

This repository is not represented as a forge fork and does not claim authorship of imported implementation material.

The implementation source is the MIT-licensed `ByBrawe/opencode-loop` repository. The preserved license states `Copyright (c) 2026 OpenCode Loop Contributors`.

Import records live under `provenance/manifests/`; raw, sanitized verification evidence lives under `provenance/evidence/`. Manifests use `provenance/manifest.schema.json` and record source paths, SHA-256 digests, import stage, and exclusions.

The intended source baseline is commit `925b599cfab213c1e5198046d468021137c8f9fe`. A later commit imports the uncommitted OpenCode 2 conversion snapshot attributable to that dirty source worktree. Installed global copies are verification inputs only and are never treated as source.

Causal performance benchmarking is deferred pending a simpler independently validated instrument. The rejected disposable harness is not imported and no performance claim is made.
