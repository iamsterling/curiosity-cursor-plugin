import { randomUUID } from "node:crypto";
import { mkdir, open, readFile, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { DiagnosticError } from "../../core/diagnostics/diagnostic.js";

export const atomicWrite = async (target: string, content: string): Promise<void> => {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, target);
  const directory = await open(path.dirname(target), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
};

export const withLease = async <T>(root: string, operation: () => Promise<T>): Promise<T> => {
  const lock = path.join(root, ".writer-lock");
  await mkdir(root, { recursive: true });
  try {
    await mkdir(lock);
  } catch {
    throw new DiagnosticError("LEDGER_WRITER_BUSY", lock);
  }
  try {
    return await operation();
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
};

export const readJSON = async (target: string): Promise<unknown> => {
  try {
    return JSON.parse(await readFile(target, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw new DiagnosticError("PERSISTENCE_CORRUPT", target);
  }
};

export const listJSON = async (directory: string): Promise<string[]> => {
  try {
    return (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
};
