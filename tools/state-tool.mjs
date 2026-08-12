#!/usr/bin/env node
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  DiagnosticError, attachContract, importLegacyV4,
  readNativeState, writeNativeState,
} from "../../src/features/loop-compat/state.js"

const args = process.argv.slice(2)
const option = (name, required = true) => {
  const index = args.indexOf(name)
  if (index >= 0 && args[index + 1]) return args[index + 1]
  if (required) throw new Error(`Missing ${name}`)
}
const print = (value) => process.stdout.write(JSON.stringify(value, null, 2) + "\n")

async function main() {
  const command = args[0]
  if (command === "import-legacy-v4") {
    const mode = args.includes("--apply") ? "apply" : "dry-run"
    return print(await importLegacyV4({ source: option("--source"), target: option("--target"), mode, toolVersion: "@iamsterling/opencode2-config/0.1.0" }))
  }
  if (command === "attach-contract") {
    const target = option("--target"), jobId = option("--job"), proposalPath = option("--proposal")
    const state = await readNativeState(target)
    const index = state.jobs.findIndex((job) => job.id === jobId)
    if (index < 0) throw new Error(`Job not found: ${jobId}`)
    const proposal = JSON.parse(await fs.readFile(proposalPath, "utf8"))
    state.jobs[index] = await attachContract(state.jobs[index], proposal, { directory: option("--directory", false) || process.cwd() })
    await writeNativeState(target, state)
    return print({ status: "attached", contractId: state.jobs[index].contract.contractId, revision: state.jobs[index].contract.revision, digest: state.jobs[index].contract.digest })
  }
  throw new Error("Usage: state-tool.mjs import-legacy-v4 --source <v4.json> --target <v1.json> [--apply] | attach-contract --target <v1.json> --job <id> --proposal <proposal.json> [--directory <project>]")
}

try { await main() } catch (error) {
  if (error instanceof DiagnosticError) print({ code: error.code, path: error.path, detail: error.detail })
  else process.stderr.write(String(error?.message || error) + "\n")
  process.exitCode = 1
}
