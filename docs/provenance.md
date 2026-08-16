# Provenance

This repository preserves attribution and reproducible records for MIT-licensed material imported during earlier product phases. The root `LICENSE` retains `Copyright (c) 2026 OpenCode Loop Contributors` and the full MIT terms.

Authoritative import records are under `provenance/manifests/`, with source paths, SHA-256 digests, import stages, and exclusions. Sanitized evidence and the dirty tracked patch remain under `provenance/evidence/`. `tools/verify-provenance.mjs` locates the two import commits across full Git history, verifies every imported byte against its manifest, and verifies the preserved patch digest.

Superseded decisions, architecture, workflow notes, research, changelog, and relocation records are under `provenance/history/`. They are explicitly historical and do not describe the current product. Pinned Cursor schema/source records remain under `provenance/cursor/`; current sanitized usage evidence remains under `docs/provenance/`.

The current plugin-authored Markdown bundle is governed by ADR 0027's Cursor-only boundary, ADR 0028's hierarchical context-preservation decision, and ADR 0029's bounded-curiosity policy with cited primary sources. No authorship claim is made over historical imported material.
