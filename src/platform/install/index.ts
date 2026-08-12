import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DiagnosticError } from "../../core/diagnostics/diagnostic.js";
import { verifyReleaseManifest, type ReleaseManifest } from "../release/index.js";

const pluginName = "opencode2-config";
const wrapperName = `${pluginName}.js`;
const wrapperFor = (entry: string): string => `export { default } from "./opencode2-config/dist/${entry}"\n`;
const receiptName = `${pluginName}.receipt.json`;
const releaseDir = (configRoot: string): string => path.join(configRoot, "plugins", pluginName);
const previousDir = (configRoot: string): string => path.join(configRoot, "plugins", `.${pluginName}.previous`);

export interface InstallReceipt {
  readonly schemaVersion: 1;
  readonly loadPaths: readonly [string];
  readonly files: readonly { readonly path: string; readonly sha256: string }[];
}
export interface StagedInstall {
  readonly configRoot: string;
  readonly source: string;
  readonly manifest: ReleaseManifest;
  readonly fault?: "before-commit";
}

const exists = async (target: string): Promise<boolean> => {
  try { await readFile(target); return true; } catch { return false; }
};
const isManagedWrapper = async (target: string): Promise<boolean> => {
  try { return /^export \{ default \} from "\.\/opencode2-config\/dist\/[A-Za-z0-9._/-]+"\n$/u.test(await readFile(target, "utf8")); } catch { return false; }
};
const failDuplicateLoadPath = async (plugins: string): Promise<void> => {
  const paths = [path.join(plugins, `${pluginName}.ts`), path.join(plugins, wrapperName)];
  if (await exists(paths[0]!)) throw new DiagnosticError("RELEASE_LOAD_PATH_DUPLICATE", paths[0]);
  if ((await exists(paths[1]!)) && !(await isManagedWrapper(paths[1]!)))
    throw new DiagnosticError("RELEASE_LOAD_PATH_DUPLICATE", paths[1]);
};

export const installStagedRelease = async ({ configRoot, source, manifest, fault }: StagedInstall): Promise<InstallReceipt> => {
  await verifyReleaseManifest(source, manifest);
  const plugins = path.join(configRoot, "plugins");
  await mkdir(plugins, { recursive: true });
  await failDuplicateLoadPath(plugins);
  const stage = path.join(plugins, `.${pluginName}.stage-${process.pid}`);
  const current = releaseDir(configRoot);
  const previous = previousDir(configRoot);
  const wrapper = path.join(plugins, wrapperName);
  const receipt: InstallReceipt = { schemaVersion: 1, loadPaths: [`plugins/${wrapperName}`], files: manifest.files };
  await rm(stage, { recursive: true, force: true });
  try {
    await mkdir(path.join(stage, "dist"), { recursive: true });
    for (const file of manifest.files)
      await cp(path.join(source, file.path), path.join(stage, "dist", file.path), { force: false, errorOnExist: true });
    await writeFile(path.join(stage, "receipt.json"), `${JSON.stringify(receipt)}\n`, "utf8");
    if (fault === "before-commit") throw new DiagnosticError("RELEASE_INSTALL_INTERRUPTED");
    await rm(previous, { recursive: true, force: true });
    try { await rename(current, previous); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    try { await rename(stage, current); } catch (error) { try { await rename(previous, current); } catch {} throw error; }
    await writeFile(wrapper, wrapperFor(manifest.entry), "utf8");
    await writeFile(path.join(plugins, receiptName), `${JSON.stringify(receipt)}\n`, "utf8");
    return receipt;
  } finally { await rm(stage, { recursive: true, force: true }); }
};

export const rollbackStagedRelease = async (configRoot: string): Promise<void> => {
  const current = releaseDir(configRoot);
  const previous = previousDir(configRoot);
  if (!(await exists(path.join(previous, "receipt.json")))) throw new DiagnosticError("RELEASE_ROLLBACK_UNAVAILABLE");
  const displaced = `${current}.rollback-${process.pid}`;
  try {
    await rename(current, displaced);
    await rename(previous, current);
  } catch (error) {
    try { await rename(displaced, current); } catch {}
    throw error;
  }
  await rm(displaced, { recursive: true, force: true });
  const receipt = await readFile(path.join(current, "receipt.json"), "utf8");
  await writeFile(path.join(configRoot, "plugins", receiptName), receipt, "utf8");
};
