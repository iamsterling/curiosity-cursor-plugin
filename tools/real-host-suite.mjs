#!/usr/bin/env node
import { once } from "node:events"
import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises"
import { spawn } from "node:child_process"
import os from "node:os"
import path from "node:path"

const host = process.env.OPENCODE2_BIN || "opencode2"
const timeout = Number(process.env.REAL_HOST_TIMEOUT_MS || 2_000)
const root = await mkdtemp(path.join(os.tmpdir(), "opencode2-real-host-"))
const paths = Object.fromEntries(["home", "config", "data", "cache", "project"].map((name) => [name, path.join(root, name)]))
await Promise.all(Object.values(paths).map((directory) => mkdir(directory, { recursive: true })))
const environment = {
  ...process.env,
  HOME: paths.home,
  XDG_CONFIG_HOME: paths.config,
  XDG_DATA_HOME: paths.data,
  XDG_CACHE_HOME: paths.cache,
  OPENCODE_CONFIG_DIR: path.join(paths.config, "opencode"),
  NO_COLOR: "1",
}
const output = []
const redact = (value) => value
  .replace(/(server password\s+)\S+/giu, "$1[REDACTED]")
  .replace(/(authorization:\s*)(?:bearer\s+)?\S+/giu, "$1[REDACTED]")
let child
const terminateGroup = async () => {
  if (!child || child.exitCode !== null) return
  try { process.kill(-child.pid, "SIGTERM") } catch { child.kill("SIGTERM") }
  await Promise.race([once(child, "exit"), new Promise((resolve) => setTimeout(resolve, 500))])
  if (child.exitCode === null) {
    try { process.kill(-child.pid, "SIGKILL") } catch { child.kill("SIGKILL") }
    await once(child, "exit")
  }
}
try {
  child = spawn(host, ["serve", "--hostname", "127.0.0.1", "--port", "0"], {
    cwd: paths.project,
    env: environment,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  })
  child.stdout.on("data", (chunk) => output.push(chunk.toString()))
  child.stderr.on("data", (chunk) => output.push(chunk.toString()))
  const spawned = await Promise.race([
    once(child, "spawn").then(() => true).catch(() => false),
    once(child, "error").then(() => false),
  ])
  if (!spawned) {
    process.stdout.write(`${JSON.stringify({ host, supported: false, reason: "REAL_HOST_BINARY_UNAVAILABLE" })}\n`)
  } else {
  await new Promise((resolve) => setTimeout(resolve, timeout))
  await terminateGroup()
  let orphaned = false
  try { process.kill(child.pid, 0); orphaned = true } catch {}
  const topLevelWrites = await readdir(root)
  const result = {
    host,
    pid: child.pid,
    exitCode: child.exitCode,
    signalCode: child.signalCode,
    isolatedPaths: paths,
    topLevelWrites,
    orphaned,
    output: redact(output.join("").trim()),
    unsupported: [
      "child-lineage: pinned host plugin API does not expose child creation",
      "prompt-metadata/hooks/tool-halves/compaction/reload/interrupt: no credential-free host session fixture exists",
    ],
  }
  if (orphaned) throw new Error("REAL_HOST_ORPHAN_PROCESS")
  process.stdout.write(`${JSON.stringify(result)}\n`)
  }
} finally {
  await terminateGroup()
  await rm(root, { recursive: true, force: true })
}
