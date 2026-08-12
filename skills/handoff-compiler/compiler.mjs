const SCHEMA = "handoff-contract/v1"
const contractKeys = new Set(["schema", "id", "revision", "taskClass", "objective", "invariant", "scope", "nonGoals", "assumptions", "units", "dependencies", "context", "criteria", "toolLimits", "handback", "parallel"])
const unitKeys = new Set(["id", "objective", "ownedArtifacts", "readOnlyEvidence", "forbiddenSurfaces", "mergeOwner", "dependsOn"])
const contextKeys = new Set(["locator", "provenance", "freshness", "treatment", "revalidated"])
const criterionKeys = new Set(["id", "statement", "oracle", "evidenceKind"])
const dependencyKeys = new Set(["producer", "consumer", "status"])
const handbackKeys = new Set(["status", "resultArtifacts", "criterionEvidence", "blocker", "contractId", "rawOutputs", "invalidatedAssumptions", "risk", "dependencies", "nextStep"])
const allowedEvidenceKinds = new Set(["red-green", "static", "before-after", "parse", "review"])
const allowedTreatments = new Set(["quote", "reference", "summary", "worker-fetch"])

const diagnostic = (code, path, detail) => ({ code, path, detail })
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const nonEmptyString = (value) => typeof value === "string" && value.trim().length > 0
const hasOnlyKeys = (value, keys) => Object.keys(value).every((key) => keys.has(key))
const hasCompletionAuthorityField = (value, path = "$") => {
  if (Array.isArray(value)) return value.flatMap((item, index) => hasCompletionAuthorityField(item, `${path}[${index}]`))
  if (!isObject(value)) return []
  return Object.entries(value).flatMap(([key, item]) => {
    const current = /^(complete|approved|lifecycle)$/i.test(key) ? [path === "$" ? key : `${path}.${key}`] : []
    return current.concat(hasCompletionAuthorityField(item, path === "$" ? key : `${path}.${key}`))
  })
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!isObject(value)) return value
  return Object.fromEntries(Object.keys(value).sort().flatMap((key) => {
    const normalized = canonicalize(value[key])
    if (normalized === undefined || (Array.isArray(normalized) && normalized.length === 0) || (isObject(normalized) && Object.keys(normalized).length === 0)) return []
    return [[key, normalized]]
  }))
}

function omitEmpty(value) {
  if (Array.isArray(value)) return value.map(omitEmpty)
  if (!isObject(value)) return value
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    const normalized = omitEmpty(item)
    if (normalized === undefined || (Array.isArray(normalized) && normalized.length === 0) || (isObject(normalized) && Object.keys(normalized).length === 0)) return []
    return [[key, normalized]]
  }))
}

export const serializeContract = (contract) => JSON.stringify(canonicalize(contract))

export function validateContract(contract, { executionIntents = {} } = {}) {
  const diagnostics = []
  const report = (code, path, detail) => diagnostics.push(diagnostic(code, path, detail))
  if (!isObject(contract)) return { diagnostics: [diagnostic("HANDOFF_SHAPE_INVALID", "$", "contract must be an object")] }

  for (const path of hasCompletionAuthorityField(contract)) report("HANDOFF_COMPLETION_AUTHORITY_VIOLATION", path, "completion authority is external")
  if (contract.schema !== SCHEMA) report("HANDOFF_SCHEMA_VERSION_UNSUPPORTED", "schema", "expected handoff-contract/v1")
  if (!hasOnlyKeys(contract, contractKeys)) report("HANDOFF_SHAPE_INVALID", "$", "unsupported contract field")
  for (const key of ["id", "taskClass", "objective", "invariant"]) if (!nonEmptyString(contract[key])) report("HANDOFF_SHAPE_INVALID", key, "must be a non-empty string")
  if (!Number.isInteger(contract.revision) || contract.revision < 1) report("HANDOFF_SHAPE_INVALID", "revision", "must be a positive integer")
  for (const key of ["scope", "nonGoals", "assumptions"]) if (key in contract && (!Array.isArray(contract[key]) || !contract[key].every(nonEmptyString))) report("HANDOFF_SHAPE_INVALID", key, "must be non-empty strings")
  if (!Array.isArray(contract.units) || contract.units.length === 0) report("HANDOFF_SHAPE_INVALID", "units", "must contain at least one unit")
  if (!Array.isArray(contract.criteria) || contract.criteria.length === 0) report("HANDOFF_SHAPE_INVALID", "criteria", "must contain at least one criterion")
  if (!isObject(contract.handback) || !hasOnlyKeys(contract.handback ?? {}, handbackKeys) || !["status", "resultArtifacts", "criterionEvidence"].every((key) => contract.handback?.[key] === "required")) report("HANDOFF_SHAPE_INVALID", "handback", "must require core report fields")

  const unitIds = new Set()
  const ownership = new Map()
  for (const [index, unit] of (contract.units ?? []).entries()) {
    const path = `units[${index}]`
    if (!isObject(unit) || !hasOnlyKeys(unit, unitKeys) || !nonEmptyString(unit.id) || !nonEmptyString(unit.objective)) {
      report("HANDOFF_SHAPE_INVALID", path, "unit must have id and objective")
      continue
    }
    if (unitIds.has(unit.id)) report("HANDOFF_SHAPE_INVALID", `${path}.id`, "unit ids must be unique")
    unitIds.add(unit.id)
    const owns = Array.isArray(unit.ownedArtifacts) && unit.ownedArtifacts.length > 0 && unit.ownedArtifacts.every(nonEmptyString)
    const reads = Array.isArray(unit.readOnlyEvidence) && unit.readOnlyEvidence.length > 0 && unit.readOnlyEvidence.every(nonEmptyString)
    if (!owns && !reads) report("HANDOFF_SHAPE_INVALID", path, "unit needs exclusive artifacts or read-only evidence")
    for (const artifact of unit.ownedArtifacts ?? []) {
      if (ownership.has(artifact)) report("HANDOFF_OWNERSHIP_CONFLICT", `${path}.ownedArtifacts`, `also owned by ${ownership.get(artifact)}`)
      else ownership.set(artifact, unit.id)
    }
    for (const key of ["forbiddenSurfaces", "dependsOn"]) if (key in unit && (!Array.isArray(unit[key]) || !unit[key].every(nonEmptyString))) report("HANDOFF_SHAPE_INVALID", `${path}.${key}`, "must be non-empty strings")
  }

  const dependencyPairs = new Map()
  if ("dependencies" in contract && !Array.isArray(contract.dependencies)) report("HANDOFF_SHAPE_INVALID", "dependencies", "must be an array")
  for (const [index, dependency] of (contract.dependencies ?? []).entries()) {
    const path = `dependencies[${index}]`
    if (!isObject(dependency) || !hasOnlyKeys(dependency, dependencyKeys) || !nonEmptyString(dependency.producer) || !nonEmptyString(dependency.consumer) || !["met", "unmet"].includes(dependency.status)) {
      report("HANDOFF_SHAPE_INVALID", path, "dependency must name producer, consumer, and status")
      continue
    }
    if (dependency.producer === dependency.consumer || !unitIds.has(dependency.producer) || !unitIds.has(dependency.consumer)) report("HANDOFF_DEPENDENCY_MISSING", path, "producer and consumer must be distinct units")
    dependencyPairs.set(`${dependency.producer}\0${dependency.consumer}`, dependency)
  }
  for (const unit of contract.units ?? []) for (const producer of unit.dependsOn ?? []) {
    const pair = dependencyPairs.get(`${producer}\0${unit.id}`)
    if (!unitIds.has(producer) || !pair) report("HANDOFF_DEPENDENCY_MISSING", `units.${unit.id}.dependsOn`, `missing producer contract for ${producer}`)
    if (pair?.status === "unmet" && executionIntents[unit.id] === "scheduled") report("HANDOFF_DEPENDENCY_MISSING", `units.${unit.id}`, "consumer cannot be scheduled before an unmet dependency")
  }
  const graph = new Map([...unitIds].map((id) => [id, []]))
  for (const dependency of contract.dependencies ?? []) if (graph.has(dependency.producer) && graph.has(dependency.consumer)) graph.get(dependency.producer).push(dependency.consumer)
  const visited = new Set(), visiting = new Set()
  const visit = (id) => {
    if (visiting.has(id)) { report("HANDOFF_DEPENDENCY_CYCLE", "dependencies", "dependencies must be acyclic"); return }
    if (visited.has(id)) return
    visiting.add(id); for (const next of graph.get(id) ?? []) visit(next); visiting.delete(id); visited.add(id)
  }
  for (const id of unitIds) visit(id)

  if ("parallel" in contract) {
    const parallel = contract.parallel
    if (!isObject(parallel) || parallel.authorized !== true || !Array.isArray(parallel.unitIds) || parallel.unitIds.length < 2 || !parallel.unitIds.every((id) => unitIds.has(id))) report("HANDOFF_PARALLEL_UNAUTHORIZED", "parallel", "explicit authorization and known units are required")
    else for (const dependency of contract.dependencies ?? []) if (parallel.unitIds.includes(dependency.producer) && parallel.unitIds.includes(dependency.consumer) && dependency.status !== "met") report("HANDOFF_PARALLEL_UNAUTHORIZED", "parallel", "unmet dependencies are incompatible with parallel work")
  }

  if ("context" in contract && !Array.isArray(contract.context)) report("HANDOFF_CONTEXT_INVALID", "context", "must be an array")
  for (const [index, reference] of (contract.context ?? []).entries()) {
    const path = `context[${index}]`
    if (!isObject(reference) || !hasOnlyKeys(reference, contextKeys) || !nonEmptyString(reference.locator) || !nonEmptyString(reference.provenance) || !["current", "stale", "unknown"].includes(reference.freshness) || !allowedTreatments.has(reference.treatment)) report("HANDOFF_CONTEXT_INVALID", path, "reference must have locator, provenance, freshness, and treatment")
    else if (reference.freshness === "stale" && reference.provenance === "summary" && reference.revalidated !== true) report("HANDOFF_CONTEXT_STALE", path, "stale authoritative summaries require revalidation")
  }

  for (const [index, criterion] of (contract.criteria ?? []).entries()) {
    const path = `criteria[${index}]`
    if (!isObject(criterion) || !hasOnlyKeys(criterion, criterionKeys) || !nonEmptyString(criterion.id) || !nonEmptyString(criterion.statement) || !nonEmptyString(criterion.oracle)) report("HANDOFF_CRITERION_UNVERIFIABLE", path, "criteria need id, observable statement, and oracle")
    if (!allowedEvidenceKinds.has(criterion?.evidenceKind)) report("HANDOFF_EVIDENCE_KIND_MISMATCH", `${path}.evidenceKind`, "unsupported evidence kind")
  }
  if (contract.taskClass === "behavioral" && !(contract.criteria ?? []).some((criterion) => criterion.evidenceKind === "red-green")) report("HANDOFF_EVIDENCE_KIND_MISMATCH", "criteria", "behavioral work requires red-green evidence")
  if ("toolLimits" in contract && (!isObject(contract.toolLimits) || Object.values(contract.toolLimits).some((value) => !nonEmptyString(value) && !Number.isInteger(value)))) report("HANDOFF_SHAPE_INVALID", "toolLimits", "limits must be scalar task bounds")
  return diagnostics.length === 0 ? { diagnostics, contract: omitEmpty(contract) } : { diagnostics }
}

export function compileHandoff(input) {
  if (!isObject(input)) return { status: "invalid", diagnostics: [diagnostic("HANDOFF_SHAPE_INVALID", "$", "compiler input must be an object")] }
  if (input.policy?.state === "denied") return { status: "denied", diagnostics: [diagnostic("HANDOFF_POLICY_DENIED", "policy", "policy denial is terminal")] }
  if (nonEmptyString(input.blockingAmbiguity)) return { status: "blocking", diagnostics: [diagnostic("HANDOFF_BLOCKING_AMBIGUITY", "blockingAmbiguity", input.blockingAmbiguity)] }
  const result = validateContract(input.contract, { executionIntents: input.executionIntents })
  return result.diagnostics.length === 0 ? { status: "proposal", contract: result.contract, diagnostics: [] } : { status: "invalid", diagnostics: result.diagnostics }
}
