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
  ],
  skills: ["skills/curiosity-implementation-discipline"],
  commands: ["commands/curiosity-deliver-change.md"],
  rules: ["rules/curiosity-delivery.mdc"],
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

test("three read-only specialists have exact model and output contracts", async () => {
  const modelByName = {
    "curiosity-strategist": "grok-4.6",
    "curiosity-reviewer": "claude-sonnet-5",
    "curiosity-researcher": "grok-4.6",
  }
  for (const agentPath of expected.agents) {
    const { frontmatter, body } = parseFrontmatter(await read(agentPath), agentPath)
    assert.equal(frontmatter.readonly, true)
    assert.equal(frontmatter.model, modelByName[frontmatter.name])
    assert.match(body, /do not delegate|never delegate/i)
    assert.match(body, /do not edit|never (?:implement or )?edit/i)
  }
  const strategist = await read(expected.agents[0])
  for (const pattern of [/FACT/, /INFERENCE/, /UNKNOWN/, /quality scenarios/i, /options/i, /trade-?offs/i, /risks/i, /recommendation/i, /ADR/i]) assert.match(strategist, pattern)
  const reviewer = await read(expected.agents[1])
  for (const pattern of [/correctness/i, /maintainability/i, /test/i, /security/i, /severity/i, /confidence/i, /evidence/i, /impact/i, /remediation/i, /OWASP/, /threat model/i, /ASVS/, /verdict/i]) assert.match(reviewer, pattern)
  for (const pattern of [/proven contract-relevant issues/i, /stable category/i, /file:line|evidence anchor/i, /acceptance criterion|invariant/i, /claim/i, /caller/i, /interface/i, /serializer/i, /failure scenario/i, /verification needed/i, /read-only/i, /do not delegate/i]) assert.match(reviewer, pattern)
  const researcher = await read(expected.agents[2])
  for (const pattern of [/primary-source hierarchy/i, /claim ledger/i, /citations/i, /contradictions/i, /negative results/i, /bounded curiosity/i, /CURIOSITY_NO_GO/]) assert.match(researcher, pattern)
})

test("one skill, command, and always-applied rule encode delivery discipline", async () => {
  const skill = await read("skills/curiosity-implementation-discipline/SKILL.md")
  for (const pattern of [/main (?:Cursor )?Agent/i, /inspect/i, /failing behavior test/i, /smallest|minimal patch/i, /project-supplied|project-supported/i, /selected verification/i, /raw output/i, /do not guess/i, /never install|do not install/i]) assert.match(skill, pattern)

  const command = await read("commands/curiosity-deliver-change.md")
  for (const pattern of [/outcome/i, /binary acceptance/i, /Todo/i, /Explore/i, /Plan Mode/i, /strategist/i, /main Agent[^.]*implement/i, /project-supported/i, /independent reviewer/i, /maximum of two review cycles|max two review cycles/i, /same reviewer/i, /evidence summary/i]) assert.match(command, pattern)
  assert.match(command, /do not depend[^.]*undocumented Task or Todo schema/i)

  const { frontmatter, body } = parseFrontmatter(await read("rules/curiosity-delivery.mdc"), "rule")
  assert.equal(frontmatter.alwaysApply, true)
  for (const pattern of [/main Agent[^.]*sole edit/i, /native Explore/i, /Plan Mode/i, /raw evidence[^.]*Todo/i, /no external runtime/i, /do not install|no installs?/i, /blocking ambiguity/i, /stop and ask/i]) assert.match(body, pattern)
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
    assert.doesNotMatch(source, /\b(?:npm|pnpm|yarn|bun|pip|brew)\s+(?:install|add)\b|\bnpx\b|curl[^\n|]*\|\s*(?:ba|z)?sh|bundled (?:script|runtime)|plugin-owned (?:CLI|service|daemon|store)|transcript parser/i, relative)
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

test("superseded Cursor ADRs defer installed behavior to ADR 0026", async () => {
  for (const decision of [
    "docs/decisions/0020-native-cursor-phase-0-and-1.md",
    "docs/decisions/0021-native-engineering-workflow.md",
  ]) {
    const source = await read(decision)
    assert.match(source, /SUPERSEDED|HISTORICAL/i)
    assert.match(source, /0026-vanilla-cursor-native-orchestration\.md/)
    assert.match(source, /coordinator/i)
    assert.match(source, /agent/i)
    assert.match(source, /hook/i)
    assert.match(source, /engineering skill/i)
    assert.match(source, /not current[^\n]*installed Cursor behavior|not current authority/i)
  }
})

test("superseded Cursor mesh research cannot present the removed surface as current", async () => {
  const audit = await read("docs/research/cursor-current-alignment-audit-2026-08-15.md")
  const index = await read("docs/research/README.md")
  for (const source of [audit, index]) {
    assert.match(source, /HISTORICAL|SUPERSEDED/i)
    assert.match(source, /0026-vanilla-cursor-native-orchestration\.md/)
    assert.match(source, /vanilla-cursor-native-orchestration\.md/)
    assert.match(source, /six-agent|six agent/i)
    assert.match(source, /writable/i)
    assert.match(source, /hook/i)
    assert.match(source, /not current|no longer current|removed/i)
  }
})
