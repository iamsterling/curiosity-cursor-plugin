# Cursor hook mesh v0.4.0

Status: normative for the native Cursor surface.

## Boundary

Cursor owns execution, permissions, Plan, native Todos, Task context, source, command results, and conversation context. The plugin adds one stateless command dispatcher. It owns no state, store, log, network client, transcript reader, scheduler, daemon, MCP controller, or completion authority. Native Todos remain progress-only. The parent performs the prompt-level Verification Gate against raw evidence.

The configured event allowlist is exactly `sessionStart`, `subagentStart`, `beforeShellExecution`, `beforeReadFile`, `postToolUse` matched to `Shell`, and `preCompact`. All use `node "${CURSOR_PLUGIN_ROOT}/hooks/curiosity-dispatch.mjs"` with a five-second timeout. `subagentStart`, `beforeShellExecution`, and `beforeReadFile` are fail-closed. The three guidance events are fail-open. Stop, subagentStop, generic preToolUse, MCP, prompt, thought/response, specialized after, Tab, sessionEnd, and workspaceOpen hooks are absent.

The dispatcher accepts at most 256 KiB on stdin, writes exactly one JSON object and a newline to stdout, writes nothing to stderr, and exits zero. Unknown events return `{}`. Malformed guidance input returns `{}`. Malformed protected input whose bounded text identifies a protected `hook_event_name` returns the event's documented denial without echoing input. This discriminator rule is necessary because one command receives no event argument.

## Event contracts

- `sessionStart`: return concise `additional_context` saying installation does not activate the skill, Cursor owns native Todos and evidence, transcripts must not be read, no plugin state exists, and the prompt-level Verification Gate reconciles raw evidence.
- `subagentStart`: unmarked Tasks are allowed. Parse only a task whose first nonempty line is `[curiosity-handoff/v1]`. Deny a malformed marked task. Allow a shape-valid marked handoff only for `curiosity-worker` or `curiosity-implementer`.
- `beforeShellExecution`: deny malformed input and any command containing the exact nonempty supplied `transcript_path`. Return native `ask` for the enumerated lexical classes: recursive/forced deletion; privilege or ownership changes; destructive Git history/clean/forced push; publication or release; deployment/infrastructure mutation; database mutation/migration; service/process termination; and package/global installation. Allow other commands. This is bounded lexical screening, not shell parsing or obfuscation resistance.
- `beforeReadFile`: deny malformed input. Deny when `file_path` or any attachment `file_path` is lexically equal to the exact nonempty supplied `transcript_path`. Ignore `content`; allow other reads. No file is opened by the dispatcher.
- `postToolUse` (matcher `Shell`): inspect only the command string. If its first 256 characters contain a valid `[curiosity-evidence/v1] check=<slug>` marker, inject bounded `additional_context` directing the parent to reconcile the actual raw Cursor result as PASS/FAIL/MISSING. Do not inspect `tool_output` and do not declare a verdict. Unmarked or invalid markers return `{}`.
- `preCompact`: return guidance to run `status` and reconstruct only from Cursor-owned Plan, native Todos, Task context, source, and evidence, asking on ambiguity. Never claim restoration and never read a transcript.

## Marked writable handoff grammar

Marked tasks are UTF-8 text no larger than 32 KiB. C0/C1 controls other than LF are invalid. The first nonempty line is the marker. It is followed immediately by these single-line headers in this exact order, then `---`, then a nonempty body:

```text
[curiosity-handoff/v1]
Role: curiosity-worker | curiosity-implementer
Mode: writable
Plan-Accepted: yes
Todo: <nonempty>
Acceptance: <nonempty>
Dependencies: <nonempty>
Readiness-Evidence: <nonempty>
Owned-Paths: <comma-separated relative paths>
Prohibited-Paths: <comma-separated relative paths>
Transcript-Access: prohibited
Session-State-Access: prohibited
Checks: <nonempty>
Test-First: required | not-applicable
Return: changed paths; diff summary; raw command output and exit status; mapped evidence; blockers; failures; assumptions
Stop-Conditions: <nonempty>
Non-Goals: <nonempty>
---
<nonempty body>
```

This validates shape, never truth. Paths must be normalized relative POSIX lexical paths. Absolute paths, traversal, backslashes, empty segments, `.` segments, glob metacharacters, duplicate paths, and ancestor/descendant overlap within or across the two lists are invalid.

## Acceptance checks

1. Config contains exactly the six allowed events, one command path, five-second timeouts, the specified fail posture, and only the `Shell` post matcher.
2. Dispatcher fixtures cover every event, malformed/size/control/path boundaries, transcript denial, command classes, and evidence non-verdict behavior.
3. Every fixture exits zero within timeout, emits one JSON object, has empty stderr, and changes no CWD entries.
4. Static scans find no shadow runtime, transcript opening, continuation, or MCP controller capability.
5. Package, Cursor manifest, capture producer, tests, official-doc provenance, and current claims identify v0.4.0.
