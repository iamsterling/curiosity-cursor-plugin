# Installation architecture

The plugin is a static Cursor manifest and Markdown/MDC bundle. It has no installer and performs no bootstrap. Local evaluation may use Cursor's documented `--plugin-dir` loading with a separate target workspace. No global installation, npm publication, release, marketplace action, or live cutover is part of repository verification.

The static bundle declares three read-only agents, one writable implementer, and five role-bound skills. Skill requirements are semantic rather than a claimed attachment API. The required invariant keeps main orchestration-only; desired host enforcement is unavailable because Cursor children inherit the parent's mode/tool envelope. Use Agent mode for writable hierarchy. Ask/Plan does not provide child write elevation.

The always-applied rule also supplies the foundational bounded-curiosity receipt and gate for substantive child output. This changes prompt semantics only: it installs no validator, hook, tool, state store, or additional asset.

The plugin never installs or downloads its own runtime, tooling, SDK, package manager, or dependencies. For a requested target-project dependency, the assigned implementer must receive explicit user approval for the exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest and lockfile changes. It must use the existing or documented manager/manifests, never guess, never install globally, never substitute `npx`, and never use curl-pipe bootstrap. Stop on ambiguity and record output, status, diff, and verification.
