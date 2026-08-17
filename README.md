![Curiosity coordinates reviewed delivery.](docs/assets/curiosity-hero.svg)

# Curiosity for Cursor

Deliver reviewed changes in Cursor.

**Cursor-only · v0.8.0 · public MIT · 4 agents · 5 skills · 12 commands · 1 rule**

## Install with Cursor Agent

With this repository already open in Cursor, paste this prompt into IDE Agent:

```text
Prepare this plugin for evaluation.
Inspect `.cursor-plugin/plugin.json`; list referenced static assets and verify 4 agents, 5 skills, 12 commands, and 1 rule.
Get my explicit permission before writing outside the workspace. After approval, use Cursor Agent file operations to stage exactly the manifest and referenced Markdown/MDC assets into `~/.cursor/plugins/local/curiosity-cursor-plugin`, preserving paths. Copy nothing else; change nothing here.
Do not use Node, Bun, npm, npx, OpenSpec CLI, hooks, MCP, or installers.
Report discrepancies. Static files do not prove discovery.
Require me to reload Cursor and open a fresh IDE Agent chat.
Before use, require observed host discovery of all components and every curiosity slash command: `/curiosity-deliver-change`, `/curiosity-bug`, `/curiosity-feature`, `/curiosity-deep-research`, `/curiosity-architecture`, `/curiosity-spec`, `/curiosity-implement`, `/curiosity-review`, `/curiosity-secure`, `/curiosity-verify`, `/curiosity-ledger`, `/curiosity-close`. Report anything unobserved.
/curiosity-deliver-change <describe the outcome you want>
```

Start with `/curiosity-deliver-change`: Explore, resolve gaps, persist an approved spec, use one writer, run full project-owned checks, and review. The installed bundle is only the manifest and referenced Markdown/MDC assets; the installed plugin needs only Cursor.

## Choose a command

| Use | Command | When to use it | Example |
| --- | --- | --- | --- |
| Default | `/curiosity-deliver-change` | Deliver an outcome. | `/curiosity-deliver-change export` |
| Fix | `/curiosity-bug` | Repair a reproduced defect. | `/curiosity-bug duplicated tax` |
| Build | `/curiosity-feature` | Add an approved capability. | `/curiosity-feature saved filters` |
| Research | `/curiosity-deep-research` | Research without edits. | `/curiosity-deep-research queue choice` |
| Decide | `/curiosity-architecture` | Choose a design. | `/curiosity-architecture cache owner` |
| Define | `/curiosity-spec` | Persist a pre-write spec. | `/curiosity-spec export criteria` |
| Execute | `/curiosity-implement` | Implement an approved package. | `/curiosity-implement account-export@r0001 <contract_sha256>` |
| Inspect | `/curiosity-review` | Independently review evidence. | `/curiosity-review current diff` |
| Protect | `/curiosity-secure` | Assess a threat or fix. | `/curiosity-secure uploads` |
| Prove | `/curiosity-verify` | Audit checks without edits. | `/curiosity-verify current change` |
| Track | `/curiosity-ledger` | Show or persist the ledger. | `/curiosity-ledger active changes` |
| Finish | `/curiosity-close` | Validate and archive a package. | `/curiosity-close export` |

## What write commands guarantee

Every mutation route requires an approved persisted spec, one writer, evidence, and independent review. Source/behavior changes require intended RED/GREEN plus all available project-owned required full checks. Spec/ledger/archive persistence uses the appropriate structural, identity, digest, package/ledger parity, and idempotency checks; it does not claim universal RED/GREEN or project tests.

Any target-project dependency requires explicit user approval of its exact package, purpose, prod/dev scope, package-manager command, and manifest/lockfile changes. Never install globally, guess a manager, use npx, or curl-pipe; stop on ambiguity. Development verification may use Bun (`bun run verify`); installation does not.

## Trust boundary

`readonly` declarations are not guarantees. Routing, skill use, main no-edit behavior, path/network access, AskQuestion, and model choice depend on host, version, policy, and semantic handling; observed behavior must be verified. Use an isolated IDE smoke before behavioral claims.

There is no runtime, hooks, MCP, or state store. OpenSpec-compatible files are not formal adoption. No marketplace, npm, global-install, or public-release claim is made; `"private": true` is an npm publication interlock.

## Docs

[Architecture](docs/architecture/current-state.md) · [Install details](docs/installation-architecture.md) · [Behavioral evaluation](docs/testing/behavioral-evals.md) · [Provenance](docs/provenance.md) · [Changelog](CHANGELOG.md) · [MIT License](LICENSE)
