# ADR 0027: Cursor-only product boundary

**Status:** Accepted
**Date:** 2026-08-16

## Context

The repository carried a static Cursor bundle alongside a separate imported runtime foundation and temporary command compatibility policy. That coexistence obscured the install boundary and created claims unsupported by the intended product.

## Decision

The product and public repository are Cursor-only as of 0.5.0. The installed surface is exactly four agents, one file-only skill, one command, and one always-applied rule. Installed assets are non-executable Markdown/MDC and require only Cursor. Repository JavaScript exists only for static verification. ADR 0028 governs the role split (three read-only specialists plus one writable implementer), context preservation, and prompt-governed main no-edit semantic invariant; it does not alter this Cursor-only file boundary.

Remove current runtime source, installers, executable/package entrypoints, runtime dependencies, compatibility aliases, and promises. Retain imported material only as clearly marked historical provenance with intact manifests, evidence, attribution, and Git-history verification.

The plugin never installs or downloads its own runtime, tooling, SDK, package manager, or dependencies. The assigned implementer may add a target-project dependency only after explicit user approval of the exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest/lockfile changes. It uses only existing or documented project machinery; no global install, guessed manager, `npx` substitution, or curl-pipe bootstrap is allowed. It records output, status, diff, and verification and stops on ambiguity.

This decision supersedes ADR 0019's coexistence and compatibility policy and ADR 0026's separate retained foundation clause. All ADRs 0001–0026 are historical and relocated under `provenance/history/decisions/`.

## Consequences

Version 0.5.0 is breaking. There is no migration alias or runtime fallback. Historical records remain reproducible but are not current architecture. npm publication remains blocked by a package metadata interlock; that interlock does not make the Git repository non-public.
