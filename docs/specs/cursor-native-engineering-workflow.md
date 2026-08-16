# Historical Cursor-native engineering workflow

**Status:** Historical and superseded for installed Cursor behavior on 2026-08-16.

The former `/curiosity-engineering <explore|propose|apply|update|status|verify|finish>` skill, custom coordinator, analyst, writable worker/generalist/implementer roles, and two-skill design are not installed and have no backward-compatible aliases. They were an uncommitted parity-oriented design, not a shipped compatibility contract.

The authoritative installed behavior is [`vanilla-cursor-native-orchestration.md`](vanilla-cursor-native-orchestration.md): the main Cursor Agent is sole editor/synthesizer; built-in Explore handles discovery; Plan Mode handles consequential planning; strategist, reviewer, and researcher are the only custom read-only agents; implementation discipline is one file-only skill; and `/curiosity-deliver-change` is the sole command.

Historical concepts retained in the replacement are binary acceptance checks, behavior-test RED before edits, minimal root-cause changes, project-supported checks, raw evidence over Todo state, independent review, and stop/ask on blocking ambiguity. No OpenSpec, Beads, lifecycle store, transcript parser, hook, MCP, executable runtime, or install behavior is introduced.
