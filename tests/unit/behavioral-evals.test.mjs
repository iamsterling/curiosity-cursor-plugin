import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import test from "node:test"
import { validateBehavioralFixtures } from "../support/behavioral-eval-validator.mjs"

const root = new URL("../../", import.meta.url)
const directory = new URL("../fixtures/behavioral-evals/", import.meta.url)
const fixtureFiles = ["blind-retry.json", "blocking-ambiguity.json", "context-compression.json", "direct-main-authority-blocked.json", "direct-main-authority-successful.json", "disguised-architecture.json", "false-root-cause.json", "hidden-criterion.json", "security-boundary.json"]
const loadFixtures = async () => Promise.all(fixtureFiles.map(async (file) => JSON.parse(await readFile(new URL(file, directory), "utf8"))))

test("all nine static behavioral fixtures are complete and cover contracts", async () => {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".json")).sort()
  assert.deepEqual(files, fixtureFiles)
  const fixtures = await loadFixtures()
  assert.doesNotThrow(() => validateBehavioralFixtures(fixtures))
  assert.match(await readFile(new URL("docs/testing/behavioral-evals.md", root), "utf8"), /static[^]*do not claim[^]*agent behavior/i)
})

test("every scenario rejects deletion or substitution of its core behavioral contract", async () => {
  const fixtures = await loadFixtures()
  const substitutions = [
    ["workClass", () => "PROBE"],
    ["applicableAgents", (fixture) => fixture.applicableAgents.slice(1)],
    ["requiredSkills", (fixture) => fixture.requiredSkills.slice(1)],
    ["prompt", () => "Perform the task correctly."],
    ["setupInstructions", (fixture) => fixture.setupInstructions.slice(0, 1)],
    ["initialFiles", (fixture) => fixture.initialFiles.map((file) => ({ ...file, content: "generic fixture\n", sha256: createHash("sha256").update("generic fixture\n").digest("hex") }))],
    ["authoritativeCriteria", (fixture) => fixture.authoritativeCriteria.slice(1)],
    ["requiredObservations", (fixture) => fixture.requiredObservations.slice(1)],
    ["forbiddenObservations", (fixture) => fixture.forbiddenObservations.slice(1)],
    ["deterministicPostconditions", (fixture) => fixture.deterministicPostconditions.slice(1)],
    ["evidenceRequired", (fixture) => fixture.evidenceRequired.slice(1)],
    ["observationOracles", (fixture) => fixture.observationOracles.map((oracle, index) => index === 0 ? { ...oracle, requiredTokens: ["generic"] } : oracle)],
  ]
  for (const fixture of fixtures) {
    for (const [field, substitute] of substitutions) {
      const mutated = fixtures.map((candidate) => candidate.id === fixture.id ? { ...candidate, [field]: substitute(candidate) } : candidate)
      assert.throws(() => validateBehavioralFixtures(mutated), new RegExp(`${fixture.id}.*${field}`, "i"), `${fixture.id}: ${field}`)
    }
  }
})

test("fixture validation recomputes hashes and rejects unsafe or unreferenced setup data", async () => {
  const fixtures = await loadFixtures()
  const mutate = (change) => fixtures.map((fixture, index) => index === 0 ? change(structuredClone(fixture)) : fixture)
  assert.throws(() => validateBehavioralFixtures(mutate((fixture) => { fixture.initialFiles[0].content += "tampered"; return fixture })), /sha256/i)
  assert.throws(() => validateBehavioralFixtures(mutate((fixture) => { fixture.initialFiles[0].path = "../escape.txt"; return fixture })), /unsafe path/i)
  assert.throws(() => validateBehavioralFixtures(mutate((fixture) => { fixture.initialFiles[0].kind = "symlink"; return fixture })), /regular file/i)
  assert.throws(() => validateBehavioralFixtures(mutate((fixture) => { fixture.initialFiles[0].content = "TOKEN=sk-test-secret-value"; fixture.initialFiles[0].sha256 = createHash("sha256").update(fixture.initialFiles[0].content).digest("hex"); return fixture })), /secret-like/i)
  assert.throws(() => validateBehavioralFixtures(mutate((fixture) => { fixture.observationOracles[0].file = "missing.txt"; return fixture })), /declared file/i)
  assert.throws(() => validateBehavioralFixtures(mutate((fixture) => { fixture.observationOracles[0].criterion = "missing criterion"; return fixture })), /declared criterion/i)
})

test("every required oracle rejects independent contract mutations", async () => {
  const fixtures = await loadFixtures()
  const mutateFixture = (fixtureId, change) => fixtures.map((fixture) => {
    if (fixture.id !== fixtureId) return fixture
    const mutated = structuredClone(fixture)
    change(mutated)
    return mutated
  })

  for (const fixture of fixtures) {
    for (const [field, oracles] of [["observationOracles", fixture.observationOracles], ["deterministicPostconditions", fixture.deterministicPostconditions]]) {
      if (oracles.length > 1) {
        assert.throws(
          () => validateBehavioralFixtures(mutateFixture(fixture.id, (mutated) => mutated[field].splice(0, 2, mutated[field][1], mutated[field][0]))),
          new RegExp(`${fixture.id}.*${field}\\[0\\]`, "i"),
          `${fixture.id}: ${field} oracle swap`,
        )
      }
      for (const [index, oracle] of oracles.entries()) {
        const otherCriterion = fixture.authoritativeCriteria.find((criterion) => criterion !== oracle.criterion)
        const otherPath = fixture.initialFiles.find((file) => file.path !== oracle.file)?.path
        const expectContractFailure = (label, change) => assert.throws(
          () => validateBehavioralFixtures(mutateFixture(fixture.id, (mutated) => change(mutated[field][index], mutated))),
          new RegExp(`${fixture.id}.*${field}\\[${index}\\]`, "i"),
          `${fixture.id}: ${field}[${index}] ${label}`,
        )

        assert.throws(
          () => validateBehavioralFixtures(mutateFixture(fixture.id, (mutated) => mutated[field].splice(index, 1))),
          new RegExp(`${fixture.id}.*${field}`, "i"),
          `${fixture.id}: ${field}[${index}] deletion`,
        )
        expectContractFailure("unsupported assertion", (candidate) => { candidate.assertion = "unsupported-assertion" })
        expectContractFailure("criterion reassignment", (candidate) => { candidate.criterion = otherCriterion })
        expectContractFailure("path reassignment", (candidate) => { candidate.file = otherPath })
        if (field === "observationOracles") {
          expectContractFailure("substituted expectation", (candidate) => {
            candidate.requiredTokens = candidate.requiredTokens.map((token, tokenIndex) => tokenIndex === 0 ? `${token} weakened` : token)
          })
        } else {
          expectContractFailure("weakened expectation", (candidate) => {
            candidate.assertion = candidate.assertion === "sha256-unchanged" ? "contains:present" : "sha256-unchanged"
          })
        }
      }
    }
  }
})
