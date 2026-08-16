<p align="center">
  <img src="docs/assets/curiosity-hero.svg" width="900" alt="Curiosity coordinates separate agents around authority, bounded curiosity, and evidence.">
</p>

# Curiosity Cursor Plugin

Curiosity is a file-only Cursor plugin that keeps the main conversation focused by delegating research, design, implementation, and review to separate contexts.

Version 0.6.0 is public MIT-licensed Markdown/MDC: four agents, five composable skills, one command, and one rule—with no runtime, hooks, MCP, SDK, or executables.

## How it works

The parent orchestrates and synthesizes. Built-in Explore finds relevant code. The strategist designs and recommends consequential decisions, while the researcher advises with external evidence; an explicit human or project owner approves or selects them. The implementer makes one bounded change and adds a failing focused test before behavior edits. A separate reviewer checks it. Reproducible evidence—not confidence or a completed todo—controls whether the work passes.

Composable skills give each role reusable expertise without mixing authority. “Bounded curiosity” means investigating important unknowns and assumptions, then stopping when more investigation would not change the decision.

Usage: `/curiosity-deliver-change <task>`

## Set up in Cursor

Paste this into a Cursor Agent:

```text
Set up https://github.com/iamsterling/curiosity-cursor-plugin with Cursor-native plugin support outside target project. Install no dependencies, runtimes, hooks, or MCP. Determine paths. Provide:
1. Exact reopen command: `agent --workspace "<absolute-target-workspace>" --plugin-dir "<absolute-plugin-directory>"`
2. Exact follow-up prompt to paste: "Verify this session's host discovery of /curiosity-deliver-change, four agents, and five skills. Report only observations and missing items; do not infer success from files alone."
As setup Agent, you cannot verify runtime discovery after I open that separate session. Do not claim automatic continuity or restart; tell me to run the command and paste the prompt.
```

## Important limits

- The main-agent no-edit rule is semantic guidance, not a host-enforced permission boundary.
- Agent model pins are preferences; selection and fallback are controlled by Cursor.
- Static repository checks pass independently of live behavior. The [live Cursor smoke plan](docs/testing/cursor-live-smoke-plan.md) has not yet been executed.

## Development and license

For development, run `bun install --frozen-lockfile`, then `bun run verify` to check the manifest, installed surface, policies, provenance, and secrets. A target-project dependency needs explicit user approval of the exact package, purpose, prod/dev scope, project-owned package-manager command, and manifest/lockfile changes. Never install globally, guess a manager, use `npx` or `curl`; stop on ambiguity. The package’s `"private": true` is an npm publication interlock only.

See the [architecture](docs/architecture/current-state.md), [MIT License](LICENSE), and [provenance notes](docs/provenance.md). Historical imports and reproducible manifests remain under [`provenance/`](provenance/).
