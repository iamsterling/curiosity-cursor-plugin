// Test-only projection validator. It proves deterministic contract-shape invariants
// for fixtures; it is not runtime authority and does not prove Cursor/model compliance.
const diagnostic = (code, path) => ({ code, path })

const scenarioKinds = ["happy", "error", "edge"]
const requiredSections = [
  "identityIntent",
  "currentBehavior",
  "delta",
  "scope",
  "requirements",
  "scenarios",
  "designConstraints",
  "todos",
  "rollback",
  "assumptions",
  "completionCriteria",
]

export const validateNativeChangeContract = (contract) => {
  const diagnostics = []
  const todos = Array.isArray(contract.todos) ? contract.todos : []

  for (const section of requiredSections) {
    if (contract[section] === undefined) diagnostics.push(diagnostic("CONTRACT_SECTION_REQUIRED", section))
  }
  for (const operation of ["ADD", "CHANGE", "REMOVE"]) {
    if (!Array.isArray(contract.delta?.[operation])) {
      diagnostics.push(diagnostic("DELTA_CATEGORY_REQUIRED", `delta.${operation}`))
    }
  }

  if (contract.profile === "full") {
    for (const kind of scenarioKinds) {
      if (!Array.isArray(contract.scenarios?.[kind]) || contract.scenarios[kind].length === 0) {
        diagnostics.push(diagnostic("FULL_SCENARIOS_REQUIRED", `scenarios.${kind}`))
      }
    }
  }

  for (const [index, todo] of todos.entries()) {
    if (todo.blocked === true && todo.selected === true) {
      diagnostics.push(diagnostic("BLOCKED_TODO_SELECTED", `todos.${index}`))
    }
    if (todo.status === "complete" && (todo.evidence?.returned !== true || todo.evidence?.passed !== true)) {
      diagnostics.push(diagnostic("COMPLETE_REQUIRES_PASSING_EVIDENCE", `todos.${index}.evidence`))
    }
    if (todo.delegated === true && todo.evidence?.returned !== true) {
      diagnostics.push(diagnostic("DELEGATION_EVIDENCE_REQUIRED", `todos.${index}.evidence`))
    }
  }

  const incompleteMandatoryTodos = todos.filter((todo) => todo.evidence?.mandatory === true
    && (todo.evidence.returned !== true || todo.evidence.passed !== true))
  if (incompleteMandatoryTodos.length > 0 && (
    !["blocked", "unverified"].includes(contract.overallStatus)
    || incompleteMandatoryTodos.some((todo) => !["blocked", "unverified"].includes(todo.status))
    || contract.allDone === true
    || contract.finish?.requested === true
    || contract.finish?.userConfirmed === true
  )) {
    diagnostics.push(diagnostic("MANDATORY_EVIDENCE_BLOCKS_COMPLETION", "todos.evidence"))
  }

  if (contract.materialDrift?.present === true && contract.materialDrift?.reaccepted !== true) {
    diagnostics.push(diagnostic("MATERIAL_DRIFT_REACCEPTANCE_REQUIRED", "materialDrift.reaccepted"))
  }
  if (contract.materialDrift?.present === true && contract.materialDrift?.revisedNativePlanAccepted !== true) {
    diagnostics.push(diagnostic("MATERIAL_DRIFT_NATIVE_PLAN_ACCEPTANCE_REQUIRED", "materialDrift.revisedNativePlanAccepted"))
  }
  if (contract.statusResolution?.ambiguous === true && contract.statusResolution?.inferred === true) {
    diagnostics.push(diagnostic("AMBIGUOUS_STATUS_MUST_NOT_BE_INFERRED", "statusResolution.inferred"))
  }
  if (contract.finish?.requested === true && contract.finish?.userConfirmed !== true) {
    diagnostics.push(diagnostic("FINISH_REQUIRES_USER_CONFIRMATION", "finish.userConfirmed"))
  }

  if (contract.reviewerHandoff?.requested === true) {
    const requiredArtifacts = ["acceptedNativePlan", "currentSource", "diff", "explicitEvidenceOutputs", "boundedTaskContext"]
    if (requiredArtifacts.some((artifact) => contract.reviewerHandoff[artifact] !== true)) {
      diagnostics.push(diagnostic("REVIEWER_HANDOFF_ARTIFACTS_REQUIRED", "reviewerHandoff"))
    }
    if (contract.reviewerHandoff.transcriptAccess === true || contract.reviewerHandoff.sessionStateAccess === true) {
      diagnostics.push(diagnostic("REVIEWER_TRANSCRIPT_SESSION_ACCESS_PROHIBITED", "reviewerHandoff"))
    }
  }

  const todoById = new Map(todos.map((todo) => [todo.id, todo]))
  for (const [groupIndex, group] of (contract.parallelGroups ?? []).entries()) {
    const owners = new Map()
    for (const todoId of group) {
      for (const file of todoById.get(todoId)?.ownedFiles ?? []) {
        if (owners.has(file)) {
          diagnostics.push(diagnostic("PARALLEL_OWNERSHIP_OVERLAP", `parallelGroups.${groupIndex}.${file}`))
        } else {
          owners.set(file, todoId)
        }
      }
    }
  }

  return diagnostics
}
