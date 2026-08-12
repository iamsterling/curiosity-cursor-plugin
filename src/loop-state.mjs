import { createHash } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"
import { serializeContract, validateContract } from "../skills/handoff-compiler/compiler.mjs"

export const NATIVE_STATE_VERSION = 1
export const CONTRACT_VERSION = "handoff-contract/v1"
const MAX_JOBS = 10_000
const MAX_REFS = 256
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const digestPattern = /^(?:sha256:)?[a-f0-9]{64}$/

export class DiagnosticError extends Error {
  constructor(code, path = "$", detail = "") {
    super(code)
    this.name = "DiagnosticError"
    this.code = code
    this.path = path
    this.detail = detail
  }
}

const fail = (code, path, detail) => { throw new DiagnosticError(code, path, detail) }
const sha256 = (contents) => createHash("sha256").update(contents).digest("hex")
const canonicalDigest = (value) => sha256(serializeContract(value))

function validateRef(ref, pathName, { criterion = false } = {}) {
  if (!object(ref)) fail("OPENCODE2_STATE_SCHEMA_INVALID", pathName)
  const allowed = criterion ? ["criterionId", "kind", "locator", "digest", "revision"] : ["id", "contextType", "locator", "digest", "revision", "required"]
  for (const key of Object.keys(ref)) if (!allowed.includes(key)) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.${key}`)
  if (criterion && (typeof ref.criterionId !== "string" || !ref.criterionId)) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.criterionId`)
  if (criterion && (typeof ref.kind !== "string" || !ref.kind)) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.kind`)
  if (typeof ref.locator !== "string" || !ref.locator || path.isAbsolute(ref.locator) || ref.locator.split(/[\\/]/).includes("..")) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.locator`)
  if (!digestPattern.test(ref.digest || "")) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.digest`)
  if (ref.revision !== undefined && (!Number.isSafeInteger(ref.revision) || ref.revision < 1)) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.revision`)
}

function validateContractAttachment(contract, pathName) {
  if (!object(contract)) fail("OPENCODE2_STATE_SCHEMA_INVALID", pathName)
  for (const field of ["schemaVersion", "contractId", "digest", "completionAuthority"]) if (typeof contract[field] !== "string" || !contract[field]) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.${field}`)
  if (contract.schemaVersion !== CONTRACT_VERSION) fail("OPENCODE2_CONTRACT_VERSION_UNSUPPORTED", `${pathName}.schemaVersion`)
  if (!Number.isSafeInteger(contract.revision) || contract.revision < 1) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.revision`)
  if (!digestPattern.test(contract.digest)) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.digest`)
  if (contract.completionAuthority !== "external-loop-evidence") fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.completionAuthority`)
  for (const field of ["dependencies", "contexts", "criteria"]) if (!Array.isArray(contract[field]) || contract[field].length > MAX_REFS) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${pathName}.${field}`)
}

export function decodeNativeState(value) {
  if (!object(value)) fail("OPENCODE2_STATE_SCHEMA_INVALID", "$")
  if (value.version !== NATIVE_STATE_VERSION) fail("OPENCODE2_STATE_VERSION_UNSUPPORTED", "$.version")
  for (const key of Object.keys(value)) if (!["version", "jobs", "imports"].includes(key)) fail("OPENCODE2_STATE_SCHEMA_INVALID", `$.${key}`)
  if (!Array.isArray(value.jobs) || value.jobs.length > MAX_JOBS) fail("OPENCODE2_STATE_SCHEMA_INVALID", "$.jobs")
  const ids = new Set()
  value.jobs.forEach((job, index) => {
    const p = `$.jobs[${index}]`
    if (!object(job) || typeof job.id !== "string" || !job.id) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${p}.id`)
    if (ids.has(job.id)) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${p}.id`)
    ids.add(job.id)
    if (job.contract !== undefined) validateContractAttachment(job.contract, `${p}.contract`)
  })
  if (value.imports !== undefined) {
    if (!Array.isArray(value.imports) || value.imports.length > 16) fail("OPENCODE2_STATE_SCHEMA_INVALID", "$.imports")
    value.imports.forEach((item, index) => {
      const p = `$.imports[${index}]`
      if (!object(item) || item.status !== "applied") fail("OPENCODE2_STATE_SCHEMA_INVALID", `${p}.status`)
      for (const field of ["sourcePath", "sourceDigest", "importedAt", "toolVersion"]) if (typeof item[field] !== "string" || !item[field]) fail("OPENCODE2_STATE_SCHEMA_INVALID", `${p}.${field}`)
    })
  }
  return structuredClone(value)
}

export async function readNativeState(target) {
  let text
  try { text = await fs.readFile(target, "utf8") } catch (error) {
    if (error?.code === "ENOENT") return { version: 1, jobs: [] }
    fail("OPENCODE2_STATE_CORRUPT", "$", error?.code || "read failed")
  }
  let parsed
  try { parsed = JSON.parse(text) } catch { fail("OPENCODE2_STATE_CORRUPT", "$") }
  return decodeNativeState(parsed)
}

export async function writeNativeState(target, state) {
  const decoded = decodeNativeState(state)
  await fs.mkdir(path.dirname(target), { recursive: true })
  const temp = path.join(path.dirname(target), `.${path.basename(target)}.${process.pid}.${Date.now()}.tmp`)
  try {
    const handle = await fs.open(temp, "wx")
    try { await handle.writeFile(JSON.stringify(decoded, null, 2) + "\n", "utf8"); await handle.sync() } finally { await handle.close() }
    await fs.rename(temp, target)
  } catch (error) {
    try { await fs.rm(temp, { force: true }) } catch {}
    if (error instanceof DiagnosticError) throw error
    fail("OPENCODE2_STATE_WRITE_FAILED", target, error?.code || "write failed")
  }
}

function decodeLegacyV4(value) {
  if (!object(value)) fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", "$")
  if (value.version !== 4) fail("OPENCODE2_LEGACY_IMPORT_VERSION_UNSUPPORTED", "$.version")
  if (!Array.isArray(value.jobs) || value.jobs.length > MAX_JOBS) fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", "$.jobs")
  const ids = new Set()
  value.jobs.forEach((job, index) => {
    if (!object(job) || typeof job.id !== "string" || !job.id || ids.has(job.id)) fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", `$.jobs[${index}].id`)
    ids.add(job.id)
    for (const field of ["runCount", "failureCount", "intervalMs", "lastRunAt"]) if (job[field] !== undefined && (!Number.isSafeInteger(job[field]) || job[field] < 0)) fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", `$.jobs[${index}].${field}`)
    if (job.enabled !== undefined && typeof job.enabled !== "boolean") fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", `$.jobs[${index}].enabled`)
    if (job.paused !== undefined && typeof job.paused !== "boolean") fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", `$.jobs[${index}].paused`)
  })
  return structuredClone(value)
}

export async function importLegacyV4({ source, target, mode = "dry-run", toolVersion, importedAt = new Date().toISOString() }) {
  if (!new Set(["dry-run", "apply"]).has(mode)) fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", "$.mode")
  let bytes, legacy
  try { bytes = await fs.readFile(source); legacy = JSON.parse(bytes.toString("utf8")) } catch { fail("OPENCODE2_LEGACY_IMPORT_SOURCE_INVALID", source) }
  legacy = decodeLegacyV4(legacy)
  const sourceDigest = `sha256:${sha256(bytes)}`
  let existing
  try { existing = await readNativeState(target) } catch (error) { throw error }
  if (existing.imports?.some((item) => item.sourceDigest === sourceDigest)) fail("OPENCODE2_LEGACY_IMPORT_ALREADY_APPLIED", "$.imports")
  if (existing.jobs.length > 0 || (existing.imports?.length || 0) > 0) fail("OPENCODE2_LEGACY_IMPORT_TARGET_NOT_EMPTY", "$.jobs")
  const state = {
    version: 1,
    jobs: legacy.jobs,
    imports: [{ status: "applied", sourcePath: path.resolve(source), sourceDigest, importedAt, toolVersion: String(toolVersion || "unknown") }],
  }
  decodeNativeState(state)
  if (mode === "apply") await writeNativeState(target, state)
  return { mode, state, sourceDigest }
}

async function verifyLocator(directory, ref, missingCode = "OPENCODE2_CONTEXT_REF_MISSING") {
  const target = path.resolve(directory, ref.locator)
  if (!target.startsWith(path.resolve(directory) + path.sep) && target !== path.resolve(directory)) fail(missingCode, ref.locator)
  let bytes
  try { bytes = await fs.readFile(target) } catch { fail(missingCode, ref.locator) }
  const expected = String(ref.digest).replace(/^sha256:/, "")
  if (sha256(bytes) !== expected) fail("OPENCODE2_CONTEXT_DIGEST_MISMATCH", ref.locator)
}

function attachmentFromContract(contract, digest) {
  return {
    schemaVersion: contract.schemaVersion,
    contractId: contract.contractId,
    revision: contract.revision,
    digest,
    completionAuthority: contract.completionAuthority,
    dependencies: (contract.dependencies || []).map(({ id, producer, consumer, status }) => ({ id, producer, consumer, status })),
    contexts: (contract.contexts || []).map((item, index) => {
      if (!item.digest) fail("OPENCODE2_CONTEXT_REF_MISSING", `$.contract.contexts[${index}].digest`)
      const { id, contextType, locator, digest } = item
      return { id, contextType, locator, digest, required: true }
    }),
    retry: contract.retry ? {
      failureClass: contract.retry.failureClass,
      unchangedReplay: contract.retry.unchangedReplay,
      deltaDigest: contract.retry.failureClass === "transport/provider" ? undefined : `sha256:${sha256(JSON.stringify({ diagnosis: contract.retry.diagnosis, preservedFacts: contract.retry.preservedFacts, invalidatedAssumptions: contract.retry.invalidatedAssumptions, changedInstructions: contract.retry.changedInstructions }))}`,
    } : undefined,
    criteria: (contract.criteria || []).map(({ id, requiredEvidence }) => ({ id, requiredEvidence: [...requiredEvidence] })),
    progressArtifactDelta: [],
    evidenceRefs: [],
  }
}

export async function attachContract(job, proposal, { directory = process.cwd() } = {}) {
  if (!object(proposal) || proposal.status !== "proposal" || !object(proposal.contract)) fail("OPENCODE2_STATE_SCHEMA_INVALID", "$.proposal")
  if (proposal.contract.schemaVersion !== CONTRACT_VERSION) fail("OPENCODE2_CONTRACT_VERSION_UNSUPPORTED", "$.proposal.contract.schemaVersion")
  const validated = validateContract(proposal.contract)
  if (!validated.contract || validated.diagnostics.length) fail("OPENCODE2_STATE_SCHEMA_INVALID", "$.proposal.contract")
  const digest = canonicalDigest(validated.contract)
  if (proposal.digest !== digest) fail("OPENCODE2_CONTRACT_DIGEST_MISMATCH", "$.proposal.digest")
  const previous = job?.contract
  if (previous && (previous.contractId !== validated.contract.contractId || validated.contract.revision < previous.revision || (validated.contract.revision === previous.revision && digest !== previous.digest))) fail("OPENCODE2_CONTRACT_REVISION_CONFLICT", "$.proposal.contract.revision")
  const attachment = attachmentFromContract(validated.contract, digest)
  for (const ref of attachment.contexts) { validateRef(ref, "$.contract.contexts"); await verifyLocator(directory, ref) }
  return { ...job, contract: attachment }
}

export async function checkContractDispatch(job, { directory = process.cwd() } = {}) {
  if (!job?.contract) return job
  const blocked = job.contract.dependencies.find((item) => item.status !== "met")
  if (blocked) fail("OPENCODE2_DEPENDENCY_BLOCKED", `$.contract.dependencies.${blocked.id}`)
  for (const ref of job.contract.contexts) { validateRef(ref, "$.contract.contexts"); await verifyLocator(directory, ref) }
  return job
}

export async function recordContractProgress(job, input, { directory = process.cwd() } = {}) {
  await checkContractDispatch(job, { directory })
  if (!Array.isArray(input?.artifactDelta) || input.artifactDelta.length === 0 || input.artifactDelta.length > MAX_REFS) fail("OPENCODE2_PROGRESS_DELTA_REQUIRED", "$.artifactDelta")
  for (const [index, ref] of input.artifactDelta.entries()) { validateRef(ref, `$.artifactDelta[${index}]`); await verifyLocator(directory, ref) }
  const criterionRefs = input.criterionEvidenceRefs || []
  for (const [index, ref] of criterionRefs.entries()) { validateRef(ref, `$.criterionEvidenceRefs[${index}]`, { criterion: true }); await verifyLocator(directory, ref, "OPENCODE2_CRITERION_EVIDENCE_MISSING") }
  return { ...job, noProgressCount: 0, lastProgressAt: Date.now(), contract: { ...job.contract, progressArtifactDelta: input.artifactDelta.slice(-MAX_REFS), evidenceRefs: [...(job.contract.evidenceRefs || []), ...criterionRefs].slice(-MAX_REFS) } }
}

export function validateContractRetry(job, retry) {
  if (!job?.contract) return retry
  if (retry?.failureClass === "transport/provider") return retry
  if (!retry?.diagnosis || !Array.isArray(retry?.changedInstructions) || retry.changedInstructions.length === 0) fail("OPENCODE2_RETRY_DELTA_REQUIRED", "$.retry")
  return retry
}

export async function attestSemanticCompletion(job, input, { directory = process.cwd() } = {}) {
  if (input?.authority !== job?.contract?.completionAuthority) fail("OPENCODE2_SEMANTIC_COMPLETION_REQUIRED", "$.authority")
  validateRef(input.attestationRef, "$.attestationRef", { criterion: true })
  await verifyLocator(directory, input.attestationRef, "OPENCODE2_CRITERION_EVIDENCE_MISSING")
  return { ...job, contract: { ...job.contract, semanticCompletion: { authority: input.authority, attestationRef: input.attestationRef, attestedAt: new Date().toISOString() } } }
}

export async function recordContractCompletion(job, input, { directory = process.cwd() } = {}) {
  await checkContractDispatch(job, { directory })
  const refs = input?.evidenceRefs || []
  const required = new Set(job.contract.criteria.flatMap((criterion) => criterion.requiredEvidence.map((kind) => `${criterion.id}\0${kind}`)))
  for (const [index, ref] of refs.entries()) {
    validateRef(ref, `$.evidenceRefs[${index}]`, { criterion: true })
    await verifyLocator(directory, ref, "OPENCODE2_CRITERION_EVIDENCE_MISSING")
    required.delete(`${ref.criterionId}\0${ref.kind}`)
  }
  if (required.size) fail("OPENCODE2_CRITERION_EVIDENCE_MISSING", "$.evidenceRefs", [...required][0])
  if (!job.contract.semanticCompletion || job.contract.semanticCompletion.authority !== job.contract.completionAuthority) fail("OPENCODE2_SEMANTIC_COMPLETION_REQUIRED", "$.semanticCompletion")
  return { ...job, goalStatus: "completed", enabled: false, paused: true, goalCompletedAt: Date.now(), contract: { ...job.contract, evidenceRefs: refs } }
}

export function recordManualOverride(job, reason, actor = "user") {
  if (!job?.contract || typeof reason !== "string" || !reason.trim()) fail("OPENCODE2_SEMANTIC_COMPLETION_REQUIRED", "$.manualOverride.reason")
  return { ...job, goalStatus: "completed", enabled: false, paused: true, goalCompletedAt: Date.now(), contract: { ...job.contract, manualOverride: { actor, reason: reason.trim(), at: new Date().toISOString(), ordinaryEvidenceCompletion: false } } }
}

export const compactionManualRequired = () => ({ code: "OPENCODE2_COMPACTION_MANUAL_REQUIRED", path: "$.compaction", detail: "Persist durable evidence and context references, then invoke /compact manually." })
