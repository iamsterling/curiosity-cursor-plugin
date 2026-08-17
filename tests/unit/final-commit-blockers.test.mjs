import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const commands = ["deliver-change", "bug", "feature", "deep-research", "review", "secure", "verify", "architecture", "spec", "ledger", "implement", "close"]
const contractFor = async (name) => JSON.parse((await read(`commands/curiosity-${name}.md`)).match(/<!-- ROUTE_CONTRACT\n([\s\S]*?)\n-->/)[1])

const aggregate = (files) => {
  const parts = []
  const paths = [...files.keys()].sort((left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8")))
  for (const path of paths) {
    for (const bytes of [Buffer.from(path, "utf8"), files.get(path)]) {
      const length = Buffer.alloc(8)
      length.writeBigUInt64BE(BigInt(bytes.length))
      parts.push(length, bytes)
    }
  }
  return createHash("sha256").update(Buffer.concat(parts)).digest("hex")
}

test("approval binding uses one reproducible aggregate over only immutable normative files", async () => {
  assert.equal(aggregate(new Map([
    ["specs/demo/spec.md", Buffer.from("spec\n")],
    ["proposal.md", Buffer.from("proposal\n")],
    ["design.md", Buffer.from("design\n")],
  ])), "d3b64ec8c50f7f9018860442ee80730c71d4050ec6039e433e4624472f734f23")

  const expected = {
    field: "contract_sha256",
    algorithm: "SHA256_UINT64BE_LENGTH_FRAMED_PATH_AND_FILE_BYTES_V1",
    pathOrder: "UTF8_BYTEWISE_ASCENDING",
    included: ["design.md", "proposal.md", "specs/<slug>/spec.md"],
    excluded: ["tasks.md", "approval.md", "evidence.md"],
  }
  for (const name of commands) assert.deepEqual((await contractFor(name)).specAuthority.approvalAggregate, expected, name)

  const rule = await read("rules/curiosity-delivery.mdc")
  assert.match(rule, /uint64be[^.]*path[^.]*file bytes/i)
  assert.match(rule, /one (?:canonical )?aggregate/i)
  assert.match(rule, /tasks\.md[^.]*approval\.md[^.]*evidence\.md[^.]*excluded/i)
  assert.match(rule, /approval\.md[^.]*algorithm[^.]*included paths[^.]*excluded paths[^.]*contract_sha256/i)
  assert.match(rule, /evidence\.md[^.]*append[^.]*must not mutate[^.]*approval-bound/i)
  const packageSpec = await read("openspec/changes/add-curiosity-spec-command/specs/curiosity-spec-command/spec.md")
  assert.match(packageSpec, /SHA256_UINT64BE_LENGTH_FRAMED_PATH_AND_FILE_BYTES_V1/)
  assert.match(packageSpec, /design\.md[^.]*proposal\.md[^.]*specs\/<slug>\/spec\.md/i)
  assert.match(packageSpec, /tasks\.md[^.]*approval\.md[^.]*evidence\.md[^.]*excluded/i)
})

test("implementer invocation modes separate writable implementation from audited verification", async () => {
  const agent = await read("agents/curiosity-implementer.md")
  const skill = await read("skills/curiosity-implementation-discipline/SKILL.md")
  for (const source of [agent, skill]) {
    assert.match(source, /SPEC_PERSIST_AND_MUTATE/)
    assert.match(source, /VERIFICATION_ONLY/)
  }
  assert.match(skill, /VERIFICATION_ONLY[^]*must not[^]*(?:persist|edit|delete)[^]*declared ephemeral caches/i)
  assert.match(skill, /VERIFICATION_ONLY[^]*before\/after[^]*(?:hash|status) audit/i)
  assert.match(skill, /SPEC_PERSIST_AND_MUTATE[^]*both[^]*curiosity-implementation-discipline[^]*curiosity-architecture-awareness/i)

  const verify = await contractFor("verify")
  assert.equal(verify.branches[0].tasks[0].invocationMode, "VERIFICATION_ONLY")
  assert.equal(verify.branches[0].writerCount, 0)
  for (const name of commands.filter((name) => name !== "verify")) {
    const contract = await contractFor(name)
    for (const task of contract.branches.flatMap((branch) => branch.tasks)) {
      if (task.agent === "curiosity-implementer") assert.equal(task.invocationMode, "SPEC_PERSIST_AND_MUTATE", name)
    }
  }
})

test("close exposes an explicit writer-free already-archived result", async () => {
  const close = await contractFor("close")
  const branch = close.branches.find(({ intent }) => intent === "ALREADY_ARCHIVED_IDENTICAL")
  assert.ok(branch)
  assert.deepEqual(branch.tasks, [])
  assert.equal(branch.writerCount, 0)
  assert.equal(branch.ownerGate, "NONE")
  assert.equal(branch.review, "NONE")
  assert.deepEqual(branch.evidence, ["exact source absence", "identical destination package aggregate", "idempotency check"])
  assert.deepEqual(branch.terminalStatuses, ["BLOCKED_EVIDENCE", "DONE"])
  assert.equal(branch.doneReason, "ALREADY_ARCHIVED_IDENTICAL")
})

test("digest mismatch reason is canonical across active contracts", async () => {
  const active = await Promise.all([
    ...commands.map((name) => read(`commands/curiosity-${name}.md`)),
    read("rules/curiosity-delivery.mdc"),
    read("agents/curiosity-implementer.md"),
    read("skills/curiosity-implementation-discipline/SKILL.md"),
  ])
  assert.doesNotMatch(active.join("\n"), /HASH_MISMATCH/)
  for (const source of active.slice(12)) assert.match(source, /SPEC_DIGEST_MISMATCH/)
  assert.deepEqual((await contractFor("spec")).reasonCodes.evidence, ["PATH_CONFLICT", "PARTIAL_PERSISTENCE", "SPEC_DIGEST_MISMATCH", "SPEC_STALE_OR_MISMATCHED"])
  assert.match(await read("openspec/changes/add-curiosity-spec-command/specs/curiosity-spec-command/spec.md"), /SPEC_DIGEST_MISMATCH/)
})

test("spec routing reason set is exact across command and normative package", async () => {
  const expected = ["AGENT_UNAVAILABLE", "SKILL_UNAVAILABLE", "TASK_UNAVAILABLE"]
  const design = await read("openspec/changes/add-curiosity-spec-command/design.md")
  const designReasons = [...design.match(/`BLOCKED_ROUTING` includes exactly one routing reason:\n\n((?:- `[^`]+`:[^\n]*\n?)+)/)[1].matchAll(/- `([^`]+)`:/g)].map((match) => match[1]).sort()
  const commandReasons = (await contractFor("spec")).reasonCodes.routing.toSorted()
  const packageSpec = await read("openspec/changes/add-curiosity-spec-command/specs/curiosity-spec-command/spec.md")
  const specReasons = [...packageSpec.match(/Required routing failures SHALL return `BLOCKED_ROUTING` with distinct ([^.]+)\./)[1].matchAll(/`([^`]+)`/g)].map((match) => match[1]).sort()

  assert.deepEqual(designReasons, expected)
  assert.deepEqual(commandReasons, expected)
  assert.deepEqual(specReasons, expected)
})

test("spec planning package states integrated persistence without obsolete normative contradictions", async () => {
  const base = "openspec/changes/add-curiosity-spec-command/"
  const files = ["proposal.md", "design.md", "specs/curiosity-spec-command/spec.md", "tasks.md"]
  const packageText = (await Promise.all(files.map((file) => read(base + file)))).join("\n")
  for (const obsolete of [
    /persistence (?:is|remains) (?:a separate, )?optional/i,
    /persistence remains a separate choice/i,
    /implementer SHALL NOT implement described target behavior/i,
    /may not implement any requirement described/i,
    /Automatically invoking the command, approving a draft, or persisting files\./i,
  ]) assert.doesNotMatch(packageText, obsolete)
  assert.match(packageText, /every writable route[^.]*automatically[^.]*approv[^.]*persist/i)
  assert.match(packageText, /same sole implementer Task[^.]*persist[^.]*mutation/i)
  assert.match(packageText, /standalone persistence[^.]*stop after persistence[^.]*no calling mutation route/i)
})
