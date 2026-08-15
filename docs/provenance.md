# Provenance

This repository is not represented as a forge fork and does not claim authorship of imported implementation material.

The implementation source is the MIT-licensed `ByBrawe/opencode-loop` repository. The preserved license states `Copyright (c) 2026 OpenCode Loop Contributors`.

Import records live under `provenance/manifests/`; raw, sanitized verification evidence lives under `provenance/evidence/`. Manifests use `provenance/manifest.schema.json` and record source paths, SHA-256 digests, import stage, and exclusions.

The intended source baseline is commit `925b599cfab213c1e5198046d468021137c8f9fe`. A later commit imports the uncommitted OpenCode 2 conversion snapshot attributable to that dirty source worktree. Installed global copies are verification inputs only and are never treated as source.

Causal performance benchmarking is deferred pending a simpler independently validated instrument. The rejected disposable harness is not imported and no performance claim is made.

The imported upstream changelog is retained as historical source material at `provenance/history/opencode-loop-CHANGELOG.md`; it does not describe this package's current identity or release channel.

The additive native Cursor Phase 1 agent adaptations were authored from reviewed files at repository baseline `5eff1e49852384bc87c8bc162a03927e03cb2e6e`. Their per-file mapping and adaptation notes are recorded in [`docs/provenance/cursor-native-phase-1.md`](provenance/cursor-native-phase-1.md). They are adaptations, not verbatim upstream imports; historical MIT attribution remains unchanged.
