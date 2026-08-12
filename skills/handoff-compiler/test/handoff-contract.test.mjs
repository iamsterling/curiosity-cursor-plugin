import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { compileHandoff, serializeContract, validateContract } from "../compiler.mjs"

const validDocs = {
  schema: "handoff-contract/v1",
  id: "docs-001",
  revision: 1,
  taskClass: "documentation",
  objective: "Correct one documented setting.",
  invariant: "The documented value matches the parsed configuration.",
  scope: ["docs/example.md"],
  nonGoals: ["No runtime behavior changes."],
  units: [{
    id: "correct-doc",
    objective: "Correct the setting example.",
    ownedArtifacts: ["docs/example.md", "skills/handoff-compiler/fixtures/docs-config.json"],
    forbiddenSurfaces: ["src/"],
  }],
  criteria: [{
    id: "config-parses",
    statement: "The example configuration parses as JSON.",
    oracle: "node JSON.parse fixture",
    evidenceKind: "static",
  }],
  handback: { status: "required", resultArtifacts: "required", criterionEvidence: "required" },
}

const validBehavior = {
  schema: "handoff-contract/v1", id: "bug-001", revision: 1, taskClass: "behavioral",
  objective: "Reject an invalid input.", invariant: "Invalid input returns a stable diagnostic.",
  units: [{ id: "implement", objective: "Implement the rejection.", ownedArtifacts: ["src/reject.mjs", "test/reject.test.mjs"] }],
  criteria: [{ id: "red-green", statement: "The focused behavior test fails before and passes after the change.", oracle: "node --test test/reject.test.mjs", evidenceKind: "red-green" }],
  handback: { status: "required", resultArtifacts: "required", criterionEvidence: "required" },
}

const diagnostics = (result) => result.diagnostics.map(({ code }) => code)
const withChange = (contract, change) => ({ ...contract, ...change })

test("A: a tiny documentation contract stays focused and omit-empty", () => {
  const result = validateContract(validDocs)
  assert.deepEqual(diagnostics(result), [])
  assert.deepEqual(Object.keys(result.contract), ["schema", "id", "revision", "taskClass", "objective", "invariant", "scope", "nonGoals", "units", "criteria", "handback"])
  assert.equal("context" in result.contract, false)
  assert.equal("toolLimits" in result.contract, false)
})

test("B: behavioral work requires red-green evidence", () => {
  assert.deepEqual(diagnostics(validateContract(validBehavior)), [])
  const withoutRedGreen = structuredClone(validBehavior)
  withoutRedGreen.criteria[0].evidenceKind = "static"
  assert.ok(diagnostics(validateContract(withoutRedGreen)).includes("HANDOFF_EVIDENCE_KIND_MISMATCH"))
})

test("C: independent parallel units need explicit authorization", () => {
  const contract = withChange(validDocs, {
    units: [
      { id: "research", objective: "Collect source facts.", readOnlyEvidence: ["https://example.test/source"], forbiddenSurfaces: ["src/"] },
      { id: "edit", objective: "Correct the document.", ownedArtifacts: ["docs/example.md"] },
    ],
    parallel: { authorized: true, unitIds: ["research", "edit"] },
  })
  assert.deepEqual(diagnostics(validateContract(contract)), [])
  delete contract.parallel.authorized
  assert.ok(diagnostics(validateContract(contract)).includes("HANDOFF_PARALLEL_UNAUTHORIZED"))
})

test("D: a sequential evidence producer can precede an integration owner", () => {
  const contract = withChange(validDocs, {
    units: [
      { id: "research", objective: "Read the source.", readOnlyEvidence: ["https://example.test/source"] },
      { id: "integrate", objective: "Update the document.", ownedArtifacts: ["docs/example.md"], dependsOn: ["research"] },
    ],
    dependencies: [{ producer: "research", consumer: "integrate", status: "unmet" }],
  })
  assert.deepEqual(diagnostics(validateContract(contract)), [])
})

test("E: a blocking ambiguity produces no implementation unit", () => {
  const result = compileHandoff({ blockingAmbiguity: "The requested behavior is unspecified.", contract: validBehavior })
  assert.equal(result.status, "blocking")
  assert.deepEqual(diagnostics(result), ["HANDOFF_BLOCKING_AMBIGUITY"])
  assert.equal("contract" in result, false)
})

test("F: review contracts carry only review inputs, not worker rationale", () => {
  const contract = withChange(validDocs, {
    taskClass: "review",
    units: [{ id: "review", objective: "Evaluate the changed artifacts against the criteria.", readOnlyEvidence: ["src/changed.mjs", "test/changed.test.mjs"] }],
    context: [{ locator: "docs/invariants.md", provenance: "repository", freshness: "current", treatment: "reference" }],
  })
  assert.deepEqual(diagnostics(validateContract(contract)), [])
  assert.equal(JSON.stringify(validateContract(contract).contract).includes("rationale"), false)
  assert.equal(JSON.stringify(validateContract(contract).contract).includes("suspected"), false)
})

test("G: invalid contracts report stable diagnostics", () => {
  const cases = [
    [withChange(validDocs, { units: [{ id: "a", objective: "A.", ownedArtifacts: ["docs/example.md"] }, { id: "b", objective: "B.", ownedArtifacts: ["docs/example.md"] }] }), "HANDOFF_OWNERSHIP_CONFLICT"],
    [withChange(validDocs, { units: [{ id: "a", objective: "A.", readOnlyEvidence: ["source"], dependsOn: ["missing"] }] }), "HANDOFF_DEPENDENCY_MISSING"],
    [withChange(validDocs, { units: [{ id: "a", objective: "A.", readOnlyEvidence: ["source"], dependsOn: ["b"] }, { id: "b", objective: "B.", readOnlyEvidence: ["source"], dependsOn: ["a"] }], dependencies: [{ producer: "a", consumer: "b", status: "unmet" }, { producer: "b", consumer: "a", status: "unmet" }] }), "HANDOFF_DEPENDENCY_CYCLE"],
    [withChange(validDocs, { context: [{ locator: "", provenance: "repository", freshness: "current", treatment: "dump" }] }), "HANDOFF_CONTEXT_INVALID"],
    [withChange(validDocs, { context: [{ locator: "summary", provenance: "summary", freshness: "stale", treatment: "summary" }] }), "HANDOFF_CONTEXT_STALE"],
    [withChange(validDocs, { criteria: [{ id: "vague", statement: "Make it good.", evidenceKind: "static" }] }), "HANDOFF_CRITERION_UNVERIFIABLE"],
    [withChange(validDocs, { schema: "handoff-contract/v2" }), "HANDOFF_SCHEMA_VERSION_UNSUPPORTED"],
    [withChange(validDocs, { complete: true }), "HANDOFF_COMPLETION_AUTHORITY_VIOLATION"],
    [{ schema: "handoff-contract/v1", id: "bad" }, "HANDOFF_SHAPE_INVALID"],
  ]
  for (const [contract, code] of cases) assert.ok(diagnostics(validateContract(contract)).includes(code), code)
  assert.ok(diagnostics(compileHandoff({ policy: { state: "denied" }, contract: validDocs })).includes("HANDOFF_POLICY_DENIED"))
})

test("adversarial mutations of valid contracts do not silently validate", () => {
  const mutations = [
    (contract) => { contract.units[0].ownedArtifacts.push(contract.units[0].ownedArtifacts[0]) },
    (contract) => { contract.context = [{ locator: "", provenance: "", freshness: "unknown", treatment: "unknown" }] },
    (contract) => { contract.criteria[0].oracle = "" },
    (contract) => { contract.handback.status = "complete" },
  ]
  for (const mutate of mutations) {
    const candidate = structuredClone(validDocs)
    mutate(candidate)
    assert.notDeepEqual(diagnostics(validateContract(candidate)), [])
  }
})

test("diagnostics keep machine code separate from path and detail", () => {
  const [first] = validateContract(withChange(validDocs, { schema: "handoff-contract/v0" })).diagnostics
  assert.deepEqual(Object.keys(first), ["code", "path", "detail"])
  assert.equal(first.code, "HANDOFF_SCHEMA_VERSION_UNSUPPORTED")
})

test("H: canonical omit-empty serialization and digest ignore insertion order", () => {
  const reordered = JSON.parse('{"handback":{"criterionEvidence":"required","resultArtifacts":"required","status":"required"},"criteria":[{"evidenceKind":"static","oracle":"node JSON.parse fixture","statement":"The example configuration parses as JSON.","id":"config-parses"}],"units":[{"forbiddenSurfaces":["src/"],"ownedArtifacts":["docs/example.md","skills/handoff-compiler/fixtures/docs-config.json"],"objective":"Correct the setting example.","id":"correct-doc"}],"nonGoals":["No runtime behavior changes."],"scope":["docs/example.md"],"invariant":"The documented value matches the parsed configuration.","objective":"Correct one documented setting.","taskClass":"documentation","revision":1,"id":"docs-001","schema":"handoff-contract/v1"}')
  const first = serializeContract(validateContract(validDocs).contract)
  const second = serializeContract(validateContract(reordered).contract)
  assert.equal(first, second)
  assert.equal(createHash("sha256").update(first).digest("hex"), createHash("sha256").update(second).digest("hex"))
})

test("skill and command remain planning-only and provider-neutral", async () => {
  const root = new URL("../../../", import.meta.url)
  const [skill, command] = await Promise.all([
    readFile(new URL("skills/handoff-compiler/SKILL.md", root), "utf8"),
    readFile(new URL("commands/compile-handoff.md", root), "utf8"),
  ])
  const prohibited = /\b(dispatch|subagent|schedule|state mutation|mark completion|openai|anthropic|gpt|claude|crafty|default model|default provider)\b/i
  assert.doesNotMatch(skill, prohibited)
  assert.doesNotMatch(command, prohibited)
})
