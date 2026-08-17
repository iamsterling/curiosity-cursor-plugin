![Curiosity coordinates focused delivery through bounded investigation and evidence.](docs/assets/curiosity-hero.svg)

# Curiosity for Cursor

Keep Cursor focused while specialists investigate, implement, and review a change.

**Cursor-only · v0.8.0 · public MIT · 4 agents · 5 skills · 12 commands · 1 rule**

![Architecture: main coordinates Explore, three read-only specialists, one writer, review, and evidence.](docs/assets/curiosity-architecture.svg)

Text equivalent: main owns criteria; Explore maps code; strategist, researcher, and reviewer advise; only the implementer edits; evidence returns through the Curiosity Gate.

## Start with a delivery

We recommend `/curiosity-deliver-change <request>`—for example, `/curiosity-deliver-change add account export`. Narrower routes are:

| Route | Commands |
| --- | --- |
| Deliver | `/curiosity-deliver-change`, `/curiosity-bug`, `/curiosity-feature` |
| Decide | `/curiosity-deep-research`, `/curiosity-architecture`, `/curiosity-spec` |
| Assure | `/curiosity-review`, `/curiosity-secure`, `/curiosity-verify` |
| Lifecycle | `/curiosity-ledger`, `/curiosity-implement`, `/curiosity-close` |

## How it works

Main orchestrates without editing. Explore finds repository facts; three read-only specialists separate design, research, and review. Before every write, Curiosity automatically creates a visible revisioned intent/acceptance contract. Consequential choices use Cursor's model-steered AskQuestion when available, with a structured owner-decision fallback.

Exact approval is persisted as an immutable OpenSpec-compatible package before the same sole implementer edits. Plan/Todo/tasks are not authority. Focused RED/GREEN plus every available repository-declared full check and independent review control completion.

## Set up in Cursor

With this repository already open in Cursor, paste this into IDE Agent. Cursor is the only setup requirement.

```text
Prepare dependency-free local evaluation. Inspect `.cursor-plugin/plugin.json` and report exact manifest-referenced static assets. Propose `~/.cursor/plugins/local/curiosity-cursor-plugin`; require explicit owner authorization before writing outside the workspace. Then use Cursor Agent file operations to copy only the manifest and referenced Markdown/MDC assets, preserving paths and changing nothing here. Run no Node, Bun, npm, package manager, npx, OpenSpec CLI, hooks, MCP, installer, or plugin code. Report inventory. Static files do not prove discovery. Tell me to reload or restart Cursor IDE, open a fresh Agent chat, and verify observed host discovery of 4 agents, 5 skills, 12 commands, and 1 rule. Confirm: `/curiosity-deliver-change`, `/curiosity-bug`, `/curiosity-feature`, `/curiosity-deep-research`, `/curiosity-architecture`, `/curiosity-spec`, `/curiosity-review`, `/curiosity-secure`, `/curiosity-verify`, `/curiosity-ledger`, `/curiosity-implement`, `/curiosity-close`. Report missing or unobserved assets.
```

The installed bundle is only the manifest plus Markdown/MDC assets. The installed plugin needs only Cursor; development verification may use Bun.

## Trust boundary

Custom agents declare `readonly`, not guarantees. Routing, skill use, main no-edit behavior, path/network access, AskQuestion, and model selection depend on host, version, policy, and semantic handling; observed behavior must be verified. An isolated IDE smoke is required before behavioral claims.

There is no runtime, hooks, MCP, or state store. OpenSpec-compatible planning files are not formal adoption. No marketplace, npm, global-install, or public-release claim is made; `"private": true` is an npm publication interlock only.

## Development and references

Maintainers can run `bun run verify`. Any target-project dependency requires explicit user approval of its exact package, purpose, prod/dev scope, project-owned package-manager command, and expected manifest/lockfile changes. Never install globally, guess a manager, substitute `npx`, or use curl-pipe bootstrap; stop on ambiguity.

[Architecture](docs/architecture/current-state.md) · [IDE smoke plan](docs/testing/cursor-live-smoke-plan.md) · [Install details](docs/installation-architecture.md) · [Provenance](docs/provenance.md) · [Changelog](CHANGELOG.md) · [MIT License](LICENSE)
