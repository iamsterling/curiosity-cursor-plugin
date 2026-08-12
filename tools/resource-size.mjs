import { execFileSync } from "node:child_process"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const baseline = process.argv[2] ?? "74fe8c5"
const prefixes = ["agents/", "commands/", "config/agents/", "skills/"]
const baselineFiles = execFileSync("git", ["ls-tree", "-r", "--name-only", baseline], { cwd: root, encoding: "utf8" })
  .trim().split("\n").filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
const baselineBytes = baselineFiles.reduce((sum, name) => sum + execFileSync("git", ["show", `${baseline}:${name}`], { cwd: root }).byteLength, 0)
const walk = async (directory) => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(async (entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))).flat()
const currentFiles = (await walk(path.join(root, "assets"))).filter((name) => /assets\/(?:commands|config\/agents|skills)\//.test(name))
const currentBytes = (await Promise.all(currentFiles.map(async (name) => (await readFile(name)).byteLength))).reduce((sum, size) => sum + size, 0)
process.stdout.write(`${JSON.stringify({ metric: "source-size-only", baseline, baselineFiles: baselineFiles.length, baselineBytes, currentFiles: currentFiles.length, currentBytes, reductionBytes: baselineBytes - currentBytes, reductionPercent: Number((((baselineBytes - currentBytes) / baselineBytes) * 100).toFixed(2)) }, null, 2)}\n`)
if (currentBytes >= baselineBytes) process.exitCode = 1
