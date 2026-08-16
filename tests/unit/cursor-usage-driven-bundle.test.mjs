import assert from "node:assert/strict"
import { lstat, readdir, readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import Ajv from "ajv"
import { parseDocument } from "yaml"
import { validateCursorUsageAggregate } from "../support/cursor-usage-aggregate-validator.mjs"

const root = new URL("../../", import.meta.url)
const read = (file) => readFile(new URL(file, root), "utf8")
const expected = {
  agents: [
    "agents/curiosity-strategist.md",
    "agents/curiosity-reviewer.md",
    "agents/curiosity-researcher.md",
    "agents/curiosity-implementer.md",
  ],
  skills: ["skills/curiosity-implementation-discipline"],
  commands: ["commands/curiosity-deliver-change.md"],
  rules: ["rules/curiosity-delivery.mdc"],
}
const expectedAgentTuples = [
  ["agents/curiosity-strategist.md", "curiosity-strategist", "grok-4.6", true],
  ["agents/curiosity-reviewer.md", "curiosity-reviewer", "claude-sonnet-5", true],
  ["agents/curiosity-researcher.md", "curiosity-researcher", "grok-4.6", true],
  ["agents/curiosity-implementer.md", "curiosity-implementer", "composer-2.5", false],
]

const assertUniqueAgentNames = (tuples) => {
  const names = tuples.map(([, name]) => name)
  assert.equal(new Set(names).size, 4, "agent names must contain four unique values")
}

const parseFrontmatter = (source, label) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/)
  assert.ok(match, `${label} needs frontmatter and a body`)
  const document = parseDocument(match[1], { uniqueKeys: true })
  assert.deepEqual(document.errors, [], `${label} frontmatter`)
  return { frontmatter: document.toJS(), body: match[2] }
}

test("manifest exposes exactly the usage-driven Cursor-native bundle", async () => {
  const manifest = JSON.parse(await read(".cursor-plugin/plugin.json"))
  const schema = JSON.parse(await read("provenance/cursor/plugin.schema.2a804442.json"))
  const validate = new Ajv({ allErrors: true }).compile(schema)
  assert.equal(validate(manifest), true, JSON.stringify(validate.errors))
  for (const [kind, paths] of Object.entries(expected)) assert.deepEqual(manifest[kind], paths, kind)
  for (const prohibited of ["hooks", "mcpServers", "variables"]) assert.equal(prohibited in manifest, false)

  const topLevel = await readdir(new URL("agents", root))
  assert.deepEqual(topLevel.sort(), expected.agents.map((agentPath) => path.basename(agentPath)).sort())
  assert.deepEqual((await readdir(new URL("commands", root))).sort(), ["curiosity-deliver-change.md"])
  assert.deepEqual((await readdir(new URL("rules", root))).sort(), ["curiosity-delivery.mdc"])
  assert.deepEqual((await readdir(new URL("skills", root))).sort(), ["curiosity-implementation-discipline"])
})

test("four specialists have exact role, model, and output contracts", async () => {
  const actualAgentTuples = []
  for (const agentPath of expected.agents) {
    const { frontmatter, body } = parseFrontmatter(await read(agentPath), agentPath)
    actualAgentTuples.push([agentPath, frontmatter.name, frontmatter.model, frontmatter.readonly])
    assert.match(body, /do not delegate|never delegate/i)
    if (frontmatter.name !== "curiosity-implementer") assert.match(body, /do not edit|never (?:implement or )?edit/i)
  }
  assert.deepEqual(actualAgentTuples, expectedAgentTuples)
  assertUniqueAgentNames(actualAgentTuples)
  const duplicateNameRegression = structuredClone(actualAgentTuples)
  duplicateNameRegression[3][1] = duplicateNameRegression[0][1]
  assert.throws(() => assertUniqueAgentNames(duplicateNameRegression), /four unique values/)
  const strategist = await read(expected.agents[0])
  for (const pattern of [/FACT/, /INFERENCE/, /UNKNOWN/, /quality scenarios/i, /options/i, /trade-?offs/i, /risks/i, /recommendation/i, /ADR/i]) assert.match(strategist, pattern)
  const reviewer = await read(expected.agents[1])
  for (const pattern of [/correctness/i, /maintainability/i, /test/i, /security/i, /severity/i, /confidence/i, /evidence/i, /impact/i, /remediation/i, /OWASP/, /threat model/i, /ASVS/, /verdict/i]) assert.match(reviewer, pattern)
  for (const pattern of [/proven contract-relevant issues/i, /stable category/i, /file:line|evidence anchor/i, /acceptance criterion|invariant/i, /claim/i, /caller/i, /interface/i, /serializer/i, /failure scenario/i, /verification needed/i, /read-only/i, /do not delegate/i]) assert.match(reviewer, pattern)
  const researcher = await read(expected.agents[2])
  for (const pattern of [/primary-source hierarchy/i, /claim ledger/i, /citations/i, /contradictions/i, /negative results/i, /bounded curiosity/i, /CURIOSITY_NO_GO/]) assert.match(researcher, pattern)

  const implementer = await read(expected.agents[3])
  for (const pattern of [/sole (?:writable )?source editor/i, /one bounded/i, /allowed paths/i, /acceptance checks/i, /focused behavior test[^.]*fails? for the intended reason/i, /project-supported/i, /DONE|BLOCKED/, /changed paths/i, /raw (?:verification )?evidence/i, /residual risk/i, /resume (?:this|the same) (?:implementer|agent|ID)/i, /no (?:orchestration|delegation)/i]) assert.match(implementer, pattern)
})

test("one skill, command, and always-applied rule encode delivery discipline", async () => {
  const skill = await read("skills/curiosity-implementation-discipline/SKILL.md")
  for (const pattern of [/implementer/i, /inspect/i, /focused behavior test[^.]*fails? for the intended reason/i, /smallest|minimal patch/i, /project-supplied|project-supported|project actually supports/i, /selected verification/i, /raw output/i, /do not guess/i, /never installs|do not install/i]) assert.match(skill, pattern)

  const command = await read("commands/curiosity-deliver-change.md")
  for (const pattern of [/outcome/i, /binary acceptance/i, /Todo/i, /Explore/i, /Plan Mode/i, /strategist/i, /exactly one[^.]*implementer/i, /preserve[^.]*implementer[^.]*ID/i, /fresh[^.]*reviewer/i, /resume[^.]*same reviewer/i, /maximum of two review cycles|max two review cycles/i, /evidence summary/i, /main[^.]*never edits/i, /mutating (?:project )?shell/i]) assert.match(command, pattern)
  assert.match(command, /do not depend[^.]*undocumented Task or Todo schema/i)

  const packetFields = ["GOAL", "DECISION/QUESTION", "IN SCOPE", "OUT OF SCOPE", "KNOWN CONTEXT", "AUTHORITATIVE INPUTS", "CONSTRAINTS", "REQUIRED OUTPUT", "DONE WHEN", "STOP/ESCALATE WHEN"]
  for (const field of packetFields) assert.match(command, new RegExp(field.replace("/", "\\/"), "i"), field)

  const { frontmatter, body } = parseFrontmatter(await read("rules/curiosity-delivery.mdc"), "rule")
  assert.equal(frontmatter.alwaysApply, true)
  for (const pattern of [/top-level/i, /orchestrat/i, /never edit/i, /implementer[^.]*sole exception/i, /semantic invariant/i, /host enforcement/i, /native Explore/i, /Agent mode/i, /Ask|Plan/i, /raw evidence[^.]*Todo/i, /never installs/i, /explicit user approval/i, /blocking ambiguity/i, /stop and ask/i]) assert.match(body, pattern)
})

test("current docs specify hierarchical context preservation without false enforcement claims", async () => {
  const current = [
    "README.md",
    "docs/architecture/current-state.md",
    "docs/decisions/0028-hierarchical-context-preservation.md",
    "docs/specs/vanilla-cursor-native-orchestration.md",
    "docs/migration/0.5.0-cursor-only.md",
  ]
  for (const file of current) {
    const source = await read(file)
    assert.match(source, /context (?:quality|preservation)|parent context/i, file)
    assert.match(source, /semantic invariant/i, file)
    assert.match(source, /host enforcement|host-enforced/i, file)
    assert.doesNotMatch(source, /Cursor (?:enforces|guarantees)[^.]*main[^.]*not edit/i, file)
  }

  const spec = await read("docs/specs/vanilla-cursor-native-orchestration.md")
  for (const pattern of [/all custom specialists[^.]*directly to (?:the )?main/i, /no nested delegation/i, /one writable implementer at a time/i, /Agent mode/i, /Ask\/Plan[^.]*cannot|cannot[^.]*Ask\/Plan/i, /main[^.]*intent[^.]*decisions/i, /acceptance criteria/i, /agent IDs/i, /reviewer verdict/i, /BLOCKED|USER_DECISION_REQUIRED/]) assert.match(spec, pattern)

  const smoke = await read("docs/testing/cursor-live-smoke-plan.md")
  for (const pattern of [/plugin discovery/i, /four agents/i, /adversarial[^.]*no-edit/i, /readonly denial/i, /writable implementer canary/i, /Ask\/Plan propagation/i, /Explore isolation/i, /BLOCK\/resume nonce/i, /same-reviewer resume/i, /fresh reviewer/i, /model fallback/i, /nesting/i, /semantic/i, /host-enforced/i, /do not run|not run/i]) assert.match(smoke, pattern)
  for (const pattern of [/HOST-OBSERVED/, /DECLARATIVE/, /direct[^.]*edit/i, /project-mutating shell/i, /refusal[^.]*delegation/i, /lack of host-enforced parent denial/i, /second[^.]*BLOCKED|BLOCKED[^.]*second/i, /USER_DECISION_REQUIRED/, /no third correction cycle/i]) assert.match(smoke, pattern)
  assert.doesNotMatch(smoke, /Plugin discovery \| HOST-ENFORCED|Four agents \| HOST-ENFORCED/)
})

test("installed surface recursively contains only non-executable regular Markdown files", async () => {
  const componentPaths = Object.values(expected).flat()
  const visit = async (relative) => {
    const absolute = new URL(relative, root)
    const stat = await lstat(absolute)
    assert.equal(stat.isSymbolicLink(), false, `${relative}: symlink`)
    if (stat.isDirectory()) {
      for (const entry of await readdir(absolute)) await visit(`${relative}/${entry}`)
      return
    }
    assert.equal(stat.isFile(), true, `${relative}: not regular file`)
    assert.ok([".md", ".mdc"].includes(path.extname(relative)), `${relative}: unexpected asset`)
    assert.equal(stat.mode & 0o111, 0, `${relative}: executable`)
    const source = await read(relative)
    assert.doesNotMatch(source, /\b(?:npm|pnpm|yarn|bun|pip|brew)\s+(?:install|add)\b|curl[^\n|]*\|\s*(?:ba|z)?sh|bundled (?:script|runtime)|plugin-owned (?:CLI|service|daemon|store)|transcript parser/i, relative)
  }
  for (const componentPath of componentPaths) await visit(componentPath)
  for (const absent of ["hooks", "mcp.json", "scripts", "bin"]) {
    await assert.rejects(lstat(new URL(absent, root)), { code: "ENOENT" })
  }
})

test("sanitized provenance records empirical motif, limitations, and distinct guidance", async () => {
  const source = await read("docs/provenance/cursor-usage-analysis-2026-08-16.md")
  for (const pattern of [
    /3,489 sessions/, /3,146 child sessions/, /general[^\n]*53\.1%/, /explore[^\n]*23\.0%/,
    /reviewer[^\n]*5\.2%/, /implementer[^\n]*2\.8%/, /strategist[^\n]*2\.5%/, /researcher[^\n]*1\.5%/,
    /review[^\n]*132/, /software-architecture[^\n]*116/, /deep-research[^\n]*34/, /software-security[^\n]*23/, /verify[^\n]*21/,
    /discover\/search\/read[^\n]*edit\/patch[^\n]*project checks[^\n]*independent review/i,
    /snapshot|non-transactional/i, /command-usage limitation/i, /empirical evidence/i, /external guidance/i, /inference/i,
  ]) assert.match(source, pattern)
  assert.doesNotMatch(source, /prompt text|raw transcript|\/Users\//i)

  const aggregateBytes = await readFile(new URL("docs/provenance/evidence/cursor-usage-aggregate-2026-08-16.json", root))
  validateCursorUsageAggregate({ bytes: aggregateBytes, documentation: source })
})

test("usage aggregate rejects filesystem paths and credential-shaped values", async () => {
  const source = await read("docs/provenance/cursor-usage-analysis-2026-08-16.md")
  const aggregateBytes = await readFile(new URL("docs/provenance/evidence/cursor-usage-aggregate-2026-08-16.json", root))
  const aggregate = JSON.parse(aggregateBytes)
  const sensitiveValues = [
    "/private/var/folders/secret/api_key=sk-test-secret",
    "/var/folders/xx/private-data",
    "/tmp/session-token",
    "/home/example/.config/credentials",
    String.raw`C:\Users\example\secrets.txt`,
    String.raw`\\server\share\credentials.txt`,
    "token=test-value",
    "credential=github_pat_testvalue",
    "client_secret=test-secret",
    "password=test-password",
  ]

  for (const sensitiveValue of sensitiveValues) {
    const mutation = structuredClone(aggregate)
    mutation.rankings.childAgents[0].name = sensitiveValue
    assert.throws(
      () => validateCursorUsageAggregate({ bytes: Buffer.from(JSON.stringify(mutation)), documentation: source }),
      /sensitive aggregate value/,
      sensitiveValue,
    )
  }

  assert.ok(aggregate.method.endpoints.includes("/api/session"))
  assert.doesNotThrow(() => validateCursorUsageAggregate({ bytes: aggregateBytes, documentation: source }))
})
