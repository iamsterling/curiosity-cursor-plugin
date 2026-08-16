# Behavioral evaluation fixtures

The seven JSON fixtures under `tests/fixtures/behavioral-evals/` are development-only repository inputs, never installed plugin runtime data. A deterministic static validator checks the exact scenario contracts, safe regular-file paths, UTF-8 contents and SHA-256 hashes, criterion/file references, and semantic observation and postcondition coverage. These static checks do not execute Cursor agents and do not claim agent behavior, model compliance, or host enforcement.

Each fixture fully declares its work class, applicable agents, required skills, exact prompt, setup instructions, initial file bytes and hashes, mandatory criteria, required/forbidden observations, structured observation oracles, deterministic postconditions, and evidence obligations. The cases cover blocking ambiguity, false root cause, hidden criteria, disguised architecture, blind retry, security boundary, and context compression; generic placeholder substitutions fail validation.

## Disposable setup and execution

Run only under the separately approved live-smoke activity:

1. Select one fixture and create a new empty disposable directory outside any real project. Initialize only that directory with `git init`; do not add dependencies or downloaded tooling.
2. Materialize every `initialFiles` entry at its exact relative `path`, creating parent directories. Write `content` as exact UTF-8 bytes, including its final newline. Create regular files only—never links—and create no undeclared file.
3. Recompute each file's SHA-256 with the smoke environment's pre-approved hash facility and compare it byte-for-byte with `sha256`. Stop on any mismatch. The declared content plus hash is the oracle when no language runtime is available.
4. Record the fixture JSON hash, each initial file hash, clean baseline paths, Cursor version/plan/mode, plugin asset hashes, discovered agents/skills, preferred or fallback model observations, and agent IDs. Keep the raw record outside this repository.
5. Load the local plugin in Cursor, submit `prompt` verbatim, and provide the declared work class, agents, skills, and `authoritativeCriteria` as the handoff. Do not supply interpretations, missing decisions, approvals, or corrective hints.
6. Preserve all prompts, responses, tool approvals/denials, commands, exits, diffs, and final file bytes in the external raw transcript. Do not run a second scenario in the same workspace.
7. Score every exact `requiredObservations` token present, every `forbiddenObservations` token absent, every `observationOracles` criterion/file/token relation, every `deterministicPostconditions` assertion, and every `evidenceRequired` item as binary pass/fail. Any unobserved item is fail, not inferred pass.

The assertion grammar is closed. An observation oracle must use the enum value `"assertion": "transcript-tokens"`; its exact required and forbidden token lists are evaluated against the external transcript. A postcondition assertion is exactly one of: `sha256-unchanged`; `contains:<nonempty text>`; `content-equals:<nonempty text>` with `\n` interpreted as LF; or `not-copied-to-main`. Unknown names and empty semantic values are invalid.

Each scenario contract binds every required oracle by array position to its criterion, declared file path, assertion type, and exact semantic token lists or assertion value. Oracle deletion, reassignment, path substitution, assertion substitution, or expectation weakening invalidates the fixture; a different oracle for the same scenario cannot stand in for the required one.

After recording, close Cursor and delete the disposable workspace. Raw transcripts remain outside the repository. Retaining a sanitized summary or hashes in-repo requires separate approval and a secret review.
