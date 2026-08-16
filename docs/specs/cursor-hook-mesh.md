# Cursor hook mesh v0.4.0

Status: normative for the native Cursor surface.

## Boundary

Cursor owns execution, permissions, Plan, native Todos, Task context, source, command results, and conversation context. The plugin adds one stateless command dispatcher. It owns no state, store, log, network client, transcript reader, scheduler, daemon, MCP controller, or completion authority. Native Todos remain progress-only. The parent performs the prompt-level Verification Gate against raw evidence.

The configured event allowlist is exactly `sessionStart`, `subagentStart`, `beforeShellExecution`, `beforeReadFile`, `postToolUse` matched to `Shell`, and `preCompact`. All use `node "${CURSOR_PLUGIN_ROOT}/hooks/curiosity-dispatch.mjs"` with a five-second timeout. `subagentStart`, `beforeShellExecution`, and `beforeReadFile` are fail-closed. The three guidance events are fail-open. Stop, subagentStop, generic preToolUse, MCP, prompt, thought/response, specialized after, Tab, sessionEnd, and workspaceOpen hooks are absent.

The dispatcher accepts at most 256 KiB on stdin, writes exactly one JSON object and a newline to stdout, writes nothing to stderr, and exits zero. Unknown events return `{}`. Malformed guidance input returns `{}`. Malformed protected input whose bounded text identifies a protected `hook_event_name` returns the first identified protected event's documented denial without echoing input. For a nonobject or otherwise undiscriminated malformed payload, an exact quoted protected event token is also a conservative indication. Parsed nonobjects, nested protected discriminators, duplicate discriminators, and a root discriminator that contradicts a protected discriminator are malformed. This discriminator rule is necessary because one command receives no event argument.

## Event contracts

- `sessionStart`: return concise `additional_context` saying installation does not activate the skill, Cursor owns native Todos and evidence, transcripts must not be read, no plugin state exists, and the prompt-level Verification Gate reconciles raw evidence.
- `subagentStart`: unmarked Tasks are allowed. Parse only a task whose first nonempty line is `[curiosity-handoff/v1]`. Deny a malformed marked task. A shape-valid marked handoff is allowed only when `Role` is `curiosity-worker` or `curiosity-implementer` and the official input field `subagent_type` exactly equals that declared custom-agent name. Missing, built-in, or mismatched types are denied.
- `beforeShellExecution`: deny malformed input and any command containing the exact nonempty supplied `transcript_path`. Return native `ask` for the enumerated direct lexical classes below. Allow other commands. The dispatcher returns a permission decision and never returns `updated_input` or otherwise rewrites the command.
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

## Consequential shell matrix

| Class | Direct forms that ask | Boundary forms that allow |
| --- | --- | --- |
| Deletion | `rm` with `-r`/`-R`/`-f` in short option tokens or `--recursive`/`--force`; forced `unlink`; `find ... -delete` | `rm -i file`, `rm --interactive file`, `rm -- ./report-rf.txt`, `find ... -print` |
| Privilege/ownership | direct `sudo`, `doas`, `chown`, `chmod` | quoted prose passed to another executable |
| Git | `reset --hard`, option-bearing `clean`, rebase/filter commands, push `-f`/`--force`/`--force-with-lease`, and a refspec token beginning `+` | ordinary push; `feature+name` not beginning `+` |
| Publication/release | direct package publish, `gh release create`, `docker push`, `twine upload` | quoted publication prose |
| Infrastructure | mutating `kubectl`, Helm, Terraform, and Pulumi forms enumerated in the dispatcher | `kubectl get`, `terraform plan` |
| Database | SQL mutation words only in direct `psql`, MySQL/MariaDB, SQLite, or `mongosh` context; direct Prisma/Rails/Rake migrations | SQL mutation prose outside a recognized database command; recognized CLI with a select-only query |
| Process/service/container | direct kill tools, mutating system/launch service actions, `docker stop`, `docker rm`, `docker kill`, `docker system prune` | process/container inspection |
| Package installation | direct `npm`/`pnpm`/`yarn`/`bun` `add` or `install`; direct `pip`/`pip3 install` | `npm run install`; quoted install prose |
| Raw disk | `mkfs*`, `dd` with an `of=/dev/...` token, destructive enumerated `diskutil` actions | `dd` whose output is not under `/dev/` |

This is deterministic, bounded token/pattern screening, not a shell parser, semantic policy engine, or obfuscation detector. It splits direct commands on unquoted `;`, `|`, `&`, or newline, recognizes simple quoted tokens and executable basenames, and checks only the listed direct forms. Shell wrappers, substitutions, aliases, unusual escaping, environment/launcher prefixes, reordered vendor-specific options, encoded text, and other obfuscation are outside its claim. Those limitations can produce false negatives; quoted or option-like text is intentionally not scanned as an arbitrary substring.

## Acceptance checks

1. Config contains exactly the six allowed events, one command path, five-second timeouts, the specified fail posture, and only the `Shell` post matcher.
2. Dispatcher fixtures cover every event, malformed/size/control/path and discriminator boundaries, official `subagent_type` matching, transcript denial, positive and negative boundaries for every command class, and evidence non-verdict behavior.
3. Every fixture exits zero within timeout, emits one JSON object, has empty stderr, and changes no CWD entries.
4. Static scans find no shadow runtime, transcript opening, continuation, or MCP controller capability.
5. Package, Cursor manifest, capture producer, tests, official-doc provenance, and current claims identify v0.4.0.
