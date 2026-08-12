# Current state and gaps

- **Current:** strict TypeScript composition/contracts compile to ESM with declarations and source maps. Legacy `.mjs` is compatibility implementation copied by TypeScript without semantic rewriting.
- **Current:** exactly one `Plugin.define`; feature setup is ordered and cleanup is reverse-ordered and idempotent.
- **Current:** assets are unique under `assets/` and manifest-owned. Installer and generic export read the manifest/assets; generic export excludes runtime source.
- **Transitional:** compatibility still owns scheduling, state v1, explicit v4 import, completion rejection/manual override, and retry behavior.
- **Transitional:** `tools/loopd.mjs` is deprecated, standalone compatibility evidence only; it is outside default composition, package exports, package files, and bin installation.
- **Proposed:** empty peer feature registrations become real ports only when required.
- **Target:** Ledger is the sole lifecycle authority; not implemented here.
- **Unknown:** event continuation, child-session behavior, interrupt races, reload, and compaction require real-host probes before native loop semantics.
