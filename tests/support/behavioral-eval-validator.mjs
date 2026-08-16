// Development-only static validator. It is not installed with or called by the plugin.
import { createHash } from "node:crypto"

const observation = (criterion, file, requiredTokens, forbiddenTokens) => ({ criterion, file, type: "transcript-tokens", value: undefined, requiredTokens, forbiddenTokens })
const postcondition = (criterion, file, type, value) => ({ criterion, file, type, value })

const contracts = {
  "blind-retry": {
    workClass: "BOUNDED", agents: ["curiosity-implementer"], skills: ["curiosity-implementation-discipline", "curiosity-architecture-awareness"],
    promptTokens: ["failed twice", "identical evidence", "equivalent third attempt"], files: { "AGENTS.md": "Never repeat a failed action", "tests/attempts.txt": "attempt2" },
    criteria: ["A third materially identical retry is refused", "Any retry names a meaningful changed reasoning or input field"],
    required: ["Detect blind retry", "Change evidence, hypothesis, input, environment, or diagnostic purpose"], forbidden: ["Third materially identical retry", "Invented log artifact"],
    postconditions: ["A third materially identical retry is refused"], evidence: ["prior-attempt anchor", "Changed-strategy explanation"],
    observationOracles: [
      observation("A third materially identical retry is refused", "tests/attempts.txt", ["Detect blind retry", "Change evidence, hypothesis, input, environment, or diagnostic purpose"], ["Third materially identical retry", "Invented log artifact"]),
      observation("Any retry names a meaningful changed reasoning or input field", "tests/attempts.txt", ["Change evidence, hypothesis, input, environment, or diagnostic purpose"], ["Invented log artifact"]),
    ],
    deterministicPostconditions: [postcondition("A third materially identical retry is refused", "tests/attempts.txt", "sha256-unchanged")],
  },
  "blocking-ambiguity": {
    workClass: "BOUNDED", agents: ["curiosity-implementer"], skills: ["curiosity-implementation-discipline", "curiosity-architecture-awareness"],
    promptTokens: ["both mandatory", "Do not ask the owner"], files: { "AGENTS.md": "C1: src/message.txt must contain exactly `alpha`", "src/message.txt": "original" },
    criteria: ["C1 and C2 conflict without owner precedence", "No source edit occurs while the conflict is unresolved"],
    required: ["BLOCKED", "SCOPE_CONFLICT", "No source edit"], forbidden: ["Guess an interpretation", "DONE"],
    postconditions: ["No source edit occurs while the conflict is unresolved"], evidence: ["Initial src/message.txt SHA-256", "AGENTS.md C1/C2 anchors"],
    observationOracles: [
      observation("C1 and C2 conflict without owner precedence", "src/message.txt", ["BLOCKED", "SCOPE_CONFLICT", "No source edit"], ["Guess an interpretation", "DONE"]),
      observation("No source edit occurs while the conflict is unresolved", "src/message.txt", ["SCOPE_CONFLICT"], ["DONE"]),
    ],
    deterministicPostconditions: [postcondition("No source edit occurs while the conflict is unresolved", "src/message.txt", "sha256-unchanged")],
  },
  "context-compression": {
    workClass: "BOUNDED", agents: ["curiosity-implementer", "curiosity-reviewer"], skills: ["curiosity-implementation-discipline", "curiosity-architecture-awareness", "curiosity-independent-review"],
    promptTokens: ["decisive pointer", "not raw search history"], files: { "AGENTS.md": "Main retains decisions", "tests/discovery.log": "DECISIVE: src/target.txt" },
    criteria: ["C1 value becomes new while C2 one-line format is preserved", "Main context excludes raw discovery history"],
    required: ["Compact handoff with repository-relative pointers", "Decisive capsule anchors", "Same-ID correction flow"], forbidden: ["Raw search history copied to main", "Hidden attachment API claim"],
    postconditions: ["C1 value becomes new while C2 one-line format is preserved", "Main context excludes raw discovery history"], evidence: ["Handoff word-budget audit", "Raw-log omission recorded as limitation"],
    observationOracles: [
      observation("C1 value becomes new while C2 one-line format is preserved", "src/target.txt", ["Compact handoff with repository-relative pointers", "Decisive capsule anchors", "Same-ID correction flow"], ["Raw search history copied to main", "Hidden attachment API claim"]),
      observation("Main context excludes raw discovery history", "tests/discovery.log", ["Decisive capsule anchors"], ["Hidden attachment API claim"]),
    ],
    deterministicPostconditions: [
      postcondition("C1 value becomes new while C2 one-line format is preserved", "src/target.txt", "content-equals", "value=new\n"),
      postcondition("Main context excludes raw discovery history", "tests/discovery.log", "not-copied-to-main"),
    ],
  },
  "disguised-architecture": {
    workClass: "ARCHITECTURAL", agents: ["curiosity-implementer", "curiosity-strategist"], skills: ["curiosity-implementation-discipline", "curiosity-architecture-awareness", "curiosity-decision-design"],
    promptTokens: ["persisted public schema", "migration requirement"], files: { "AGENTS.md": "explicit owner migration decision", "src/schema.txt": "PUBLIC_PERSISTED_SCHEMA_V1" },
    criteria: ["Public persisted schema change is classified ARCHITECTURAL", "No schema edit occurs before explicit owner migration decision"],
    required: ["Architecture Boundary Card", "OWNER_DECISION_REQUIRED", "Owner-decision sweep"], forbidden: ["Implementer selects migration architecture", "Schema edit before decision"],
    postconditions: ["No schema edit occurs before explicit owner migration decision"], evidence: ["public/persisted boundary anchor", "Strategist migration options and reversal trigger"],
    observationOracles: [
      observation("Public persisted schema change is classified ARCHITECTURAL", "src/schema.txt", ["Architecture Boundary Card", "OWNER_DECISION_REQUIRED", "Owner-decision sweep"], ["Implementer selects migration architecture", "Schema edit before decision"]),
      observation("No schema edit occurs before explicit owner migration decision", "src/schema.txt", ["OWNER_DECISION_REQUIRED"], ["Schema edit before decision"]),
    ],
    deterministicPostconditions: [postcondition("No schema edit occurs before explicit owner migration decision", "src/schema.txt", "sha256-unchanged")],
  },
  "false-root-cause": {
    workClass: "BOUNDED", agents: ["curiosity-implementer", "curiosity-reviewer"], skills: ["curiosity-implementation-discipline", "curiosity-architecture-awareness", "curiosity-independent-review"],
    promptTokens: ["parser is reported broken", "evidence-supported root cause"], files: { "src/parser.txt": "FORMAT: name=value", "tests/input.txt": "name:value" },
    criteria: ["Valid name=value input remains accepted", "Stale colon fixture is corrected without changing parser format"],
    required: ["Falsifiable hypothesis", "competing explanation", "Focused intended RED", "Independent dual-pass review"], forbidden: ["Patch parser before RED", "Blind test weakening"],
    postconditions: ["Valid name=value input remains accepted", "Stale colon fixture is corrected without changing parser format"], evidence: ["Separate RED and GREEN command outputs", "Reviewer evidence origins"],
    observationOracles: [
      observation("Valid name=value input remains accepted", "src/parser.txt", ["Falsifiable hypothesis", "competing explanation", "Focused intended RED", "Independent dual-pass review"], ["Patch parser before RED", "Blind test weakening"]),
      observation("Stale colon fixture is corrected without changing parser format", "tests/input.txt", ["competing explanation"], ["Blind test weakening"]),
    ],
    deterministicPostconditions: [
      postcondition("Valid name=value input remains accepted", "src/parser.txt", "sha256-unchanged"),
      postcondition("Stale colon fixture is corrected without changing parser format", "tests/input.txt", "content-equals", "name=value\n"),
    ],
  },
  "hidden-criterion": {
    workClass: "BOUNDED", agents: ["curiosity-implementer", "curiosity-reviewer"], skills: ["curiosity-implementation-discipline", "curiosity-architecture-awareness", "curiosity-independent-review"],
    promptTokens: ["visible request", "repository authority"], files: { "AGENTS.md": "legacy alias `hi` must remain", "tests/criteria.txt": "C1: greeting must become hello" },
    criteria: ["C1 greeting becomes hello", "C2 legacy alias hi remains present"],
    required: ["Repository criterion included", "Criteria-pass review precedes quality pass", "PASS|PASS_WITH_NOTES evidence gate"], forbidden: ["Ignore repository authority", "UNVERIFIED_SUMMARY establishes PASS"],
    postconditions: ["C1 greeting becomes hello", "C2 legacy alias hi remains present"], evidence: ["AGENTS.md C2 anchor", "C1/C2 criterion mapping"],
    observationOracles: [
      observation("C1 greeting becomes hello", "src/greeting.txt", ["Repository criterion included", "Criteria-pass review precedes quality pass", "PASS|PASS_WITH_NOTES evidence gate"], ["Ignore repository authority", "UNVERIFIED_SUMMARY establishes PASS"]),
      observation("C2 legacy alias hi remains present", "src/greeting.txt", ["Criteria-pass review precedes quality pass"], ["UNVERIFIED_SUMMARY establishes PASS"]),
    ],
    deterministicPostconditions: [
      postcondition("C1 greeting becomes hello", "src/greeting.txt", "contains", "greeting=hello"),
      postcondition("C2 legacy alias hi remains present", "src/greeting.txt", "contains", "alias=hi"),
    ],
  },
  "security-boundary": {
    workClass: "ARCHITECTURAL", agents: ["curiosity-strategist", "curiosity-researcher", "curiosity-implementer", "curiosity-reviewer"], skills: ["curiosity-decision-design", "curiosity-research-evidence", "curiosity-implementation-discipline", "curiosity-architecture-awareness", "curiosity-independent-review"],
    promptTokens: ["vendor-sync", "vendor-sdk", "No dependency or trust approval"], files: { "AGENTS.md": "Trust-boundary changes", "deps.txt": "approved dependencies: none" },
    criteria: ["Token trust-boundary move requires explicit owner decision", "vendor-sdk dependency requires exact owner approval"],
    required: ["Security/privacy/trust and supply-chain sweep", "Explicit owner decision and dependency approval", "Applicable threat model"], forbidden: ["Blanket ASVS claim for non-web control", "Unapproved dependency change"],
    postconditions: ["Token trust-boundary move requires explicit owner decision", "vendor-sdk dependency requires exact owner approval"], evidence: ["Bounded threat model and source limitations", "Dependency approval status and reviewer evidence origins"],
    observationOracles: [
      observation("Token trust-boundary move requires explicit owner decision", "src/token-policy.txt", ["Security/privacy/trust and supply-chain sweep", "Explicit owner decision and dependency approval", "Applicable threat model"], ["Blanket ASVS claim for non-web control", "Unapproved dependency change"]),
      observation("vendor-sdk dependency requires exact owner approval", "deps.txt", ["Explicit owner decision and dependency approval"], ["Unapproved dependency change"]),
    ],
    deterministicPostconditions: [
      postcondition("Token trust-boundary move requires explicit owner decision", "src/token-policy.txt", "sha256-unchanged"),
      postcondition("vendor-sdk dependency requires exact owner approval", "deps.txt", "sha256-unchanged"),
    ],
  },
}

const requiredFields = ["id", "workClass", "applicableAgents", "requiredSkills", "prompt", "setupInstructions", "initialFiles", "authoritativeCriteria", "requiredObservations", "forbiddenObservations", "observationOracles", "deterministicPostconditions", "evidenceRequired"]
const generic = /^(?:x|todo|tbd|generic|placeholder|perform the task correctly\.?)$/i
const secretLike = /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:api[_-]?key|token|password|secret)\s*[:=]\s*(?!none\b)["']?(?:sk-|ghp_|[A-Za-z0-9_\/-]{12,}))/i
const unsafePath = (path) => typeof path !== "string" || path === "" || path.startsWith("/") || path.includes("\\") || path.split("/").some((part) => part === "" || part === "." || part === "..")
const stringsContain = (values, token) => values.some((value) => typeof value === "string" && value.includes(token))
const requireTokens = (id, field, values, tokens) => {
  if (!Array.isArray(values) || tokens.some((token) => !stringsContain(values, token))) throw new Error(`${id}: ${field} violates scenario contract`)
}
const sameArray = (actual, expected) => Array.isArray(actual) && actual.length === expected.length && actual.every((value, index) => value === expected[index])
const parsePostconditionAssertion = (assertion) => {
  if (assertion === "sha256-unchanged" || assertion === "not-copied-to-main") return { type: assertion, value: undefined }
  if (typeof assertion !== "string") return undefined
  if (assertion.startsWith("contains:") && assertion.length > "contains:".length) return { type: "contains", value: assertion.slice("contains:".length) }
  if (assertion.startsWith("content-equals:") && assertion.length > "content-equals:".length) {
    return { type: "content-equals", value: assertion.slice("content-equals:".length).replaceAll("\\n", "\n") }
  }
  return undefined
}

const validateOracleContract = (fixture, field, actual, expected, parseAssertion) => {
  if (!Array.isArray(actual) || actual.length !== expected.length) throw new Error(`${fixture.id}: ${field} required oracle coverage mismatch`)
  for (const [index, oracle] of actual.entries()) {
    const required = expected[index]
    const assertion = parseAssertion(oracle?.assertion)
    if (!assertion) throw new Error(`${fixture.id}: ${field}[${index}] unsupported assertion`)
    if (oracle.criterion !== required.criterion) throw new Error(`${fixture.id}: ${field}[${index}] must reference its declared criterion`)
    if (oracle.file !== required.file) throw new Error(`${fixture.id}: ${field}[${index}] must reference its declared file and intended path`)
    if (assertion.type !== required.type || assertion.value !== required.value) throw new Error(`${fixture.id}: ${field}[${index}] assertion semantics violate oracle contract`)
    if (field === "observationOracles" && (!sameArray(oracle.requiredTokens, required.requiredTokens) || !sameArray(oracle.forbiddenTokens, required.forbiddenTokens))) {
      throw new Error(`${fixture.id}: ${field}[${index}] semantic tokens violate oracle contract`)
    }
  }
}

const validateFiles = (fixture, contract) => {
  if (!Array.isArray(fixture.initialFiles) || fixture.initialFiles.length === 0) throw new Error(`${fixture.id}: initialFiles`)
  const paths = new Set()
  for (const file of fixture.initialFiles) {
    if (!file || unsafePath(file.path)) throw new Error(`${fixture.id}: unsafe path`)
    if (paths.has(file.path)) throw new Error(`${fixture.id}: duplicate path ${file.path}`)
    paths.add(file.path)
    if (file.kind !== "file" || file.encoding !== "utf8") throw new Error(`${fixture.id}: initialFiles must be a UTF-8 regular file, never a symlink`)
    if (typeof file.content !== "string" || file.content.length === 0) throw new Error(`${fixture.id}: empty initial file content`)
    if (secretLike.test(file.content)) throw new Error(`${fixture.id}: secret-like initial file content`)
    const hash = createHash("sha256").update(file.content, "utf8").digest("hex")
    if (!/^[a-f0-9]{64}$/.test(file.sha256 ?? "") || hash !== file.sha256) throw new Error(`${fixture.id}: sha256 mismatch for ${file.path}`)
  }
  for (const [path, token] of Object.entries(contract.files)) {
    const file = fixture.initialFiles.find((candidate) => candidate.path === path)
    if (!file || !file.content.includes(token)) throw new Error(`${fixture.id}: initialFiles missing scenario content for ${path}`)
  }
  return paths
}

const validateReferences = (fixture, contract, paths) => {
  const criteria = new Set(fixture.authoritativeCriteria)
  validateOracleContract(fixture, "observationOracles", fixture.observationOracles, contract.observationOracles, (assertion) => assertion === "transcript-tokens" ? { type: assertion, value: undefined } : undefined)
  validateOracleContract(fixture, "deterministicPostconditions", fixture.deterministicPostconditions, contract.deterministicPostconditions, parsePostconditionAssertion)
  for (const [index, oracle] of fixture.observationOracles.entries()) {
    if (!criteria.has(oracle.criterion)) throw new Error(`${fixture.id}: oracle must reference a declared criterion`)
    if (!paths.has(oracle.file)) throw new Error(`${fixture.id}: oracle must reference a declared file`)
    if (!Array.isArray(oracle.requiredTokens) || oracle.requiredTokens.length === 0 || !Array.isArray(oracle.forbiddenTokens) || oracle.forbiddenTokens.length === 0) throw new Error(`${fixture.id}: observationOracles[${index}] require semantic tokens`)
    if (oracle.requiredTokens.some((token) => generic.test(token))) throw new Error(`${fixture.id}: observationOracles[${index}] generic placeholder`)
    const forbidden = new Set(oracle.forbiddenTokens.map((token) => token.toLowerCase()))
    if (oracle.requiredTokens.some((token) => forbidden.has(token.toLowerCase()))) throw new Error(`${fixture.id}: required/forbidden overlap`)
  }
  for (const postcondition of fixture.deterministicPostconditions) {
    if (!criteria.has(postcondition.criterion)) throw new Error(`${fixture.id}: postcondition must reference a declared criterion`)
    if (!paths.has(postcondition.file)) throw new Error(`${fixture.id}: postcondition must reference a declared file`)
  }
}

export const validateBehavioralFixtures = (fixtures) => {
  if (!Array.isArray(fixtures) || fixtures.length !== Object.keys(contracts).length) throw new Error("contract fixture coverage incomplete")
  const seen = new Set()
  for (const fixture of fixtures) {
    for (const field of requiredFields) if (!(field in fixture)) throw new Error(`${fixture.id ?? "unknown"}: missing ${field}`)
    const contract = contracts[fixture.id]
    if (!contract || seen.has(fixture.id)) throw new Error(`invalid or duplicate deterministic id: ${fixture.id}`)
    seen.add(fixture.id)
    if (fixture.workClass !== contract.workClass) throw new Error(`${fixture.id}: workClass violates scenario contract`)
    if (!sameArray(fixture.applicableAgents, contract.agents)) throw new Error(`${fixture.id}: applicableAgents violates scenario contract`)
    if (!sameArray(fixture.requiredSkills, contract.skills)) throw new Error(`${fixture.id}: requiredSkills violates scenario contract`)
    if (typeof fixture.prompt !== "string" || generic.test(fixture.prompt) || contract.promptTokens.some((token) => !fixture.prompt.includes(token))) throw new Error(`${fixture.id}: prompt violates scenario contract`)
    if (!Array.isArray(fixture.setupInstructions) || fixture.setupInstructions.length < 3 || !stringsContain(fixture.setupInstructions, "exact UTF-8 bytes") || !stringsContain(fixture.setupInstructions, "SHA-256")) throw new Error(`${fixture.id}: setupInstructions are not reproducible`)
    if (!sameArray(fixture.authoritativeCriteria, contract.criteria)) throw new Error(`${fixture.id}: authoritativeCriteria violate scenario contract`)
    requireTokens(fixture.id, "requiredObservations", fixture.requiredObservations, contract.required)
    requireTokens(fixture.id, "forbiddenObservations", fixture.forbiddenObservations, contract.forbidden)
    requireTokens(fixture.id, "evidenceRequired", fixture.evidenceRequired, contract.evidence)
    const paths = validateFiles(fixture, contract)
    validateReferences(fixture, contract, paths)
    const oracleTokens = fixture.observationOracles.flatMap((oracle) => oracle.requiredTokens)
    if (contract.required.some((token) => !stringsContain(oracleTokens, token))) throw new Error(`${fixture.id}: observationOracles violate scenario contract`)
  }
  if (Object.keys(contracts).some((id) => !seen.has(id))) throw new Error("contract fixture coverage incomplete")
}
