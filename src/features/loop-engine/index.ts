import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { DiagnosticError } from "../../core/diagnostics/diagnostic.js";
import { atomicWrite, readJSON, withLease } from "../../platform/persistence/atomic-store.js";
export type { IterationBudget, LoopContinuationPort } from "./ports.js";

export interface LoopJournal {
  readonly schemaVersion: 1;
  readonly revision: number;
  readonly rootSessionID: string;
  readonly claim: { readonly workID: string; readonly token: string; readonly revision: number; readonly digest: string };
  readonly dispatch: { readonly id: string; readonly digest: string };
  readonly mode: "running" | "paused" | "stopping" | "stopped" | "ambiguous";
  readonly budgets: { readonly maxIterations: number; readonly maxNoProgress: number; readonly maxChildren: number; readonly maxTools: number };
  readonly iteration: number;
  readonly currentIterationID: string;
  readonly promptID: string;
  readonly noProgress: number;
  readonly evidenceCursor: number;
  readonly terminalEventIDs: readonly string[];
  readonly childSessionIDs: readonly string[];
  readonly stopReason?: string;
}
interface Effects { prompt(input: { sessionID: string; text: string; id: string; metadata: Record<string, string>; resume: true }): Promise<unknown>; interrupt(input: { sessionID: string }): Promise<unknown> }
const promptFor = (journal: LoopJournal): Parameters<Effects["prompt"]>[0] => ({ sessionID: journal.rootSessionID, text: `Continue accepted claim ${journal.claim.workID} at revision ${journal.claim.revision}. Use Ledger tools for all lifecycle proposals.`, id: journal.promptID, metadata: { "opencode2-config": "native-loop-v1", iteration: String(journal.iteration), claim: journal.claim.digest, causation: journal.currentIterationID }, resume: true });

export class NativeLoopEngine {
  private readonly journalPath: string;
  private constructor(readonly root: string, private readonly effects: Effects) { this.journalPath = path.join(root, "journal.json"); }
  static async open(projectDirectory: string, effects: Effects): Promise<NativeLoopEngine> { const root = path.join(projectDirectory, ".opencode/opencode2-config/execution-journal/v1"); await mkdir(root, { recursive: true }); return new NativeLoopEngine(root, effects); }
  async status(): Promise<LoopJournal> { const value = await readJSON(this.journalPath); if (!value || (value as { schemaVersion?: number }).schemaVersion !== 1) throw new DiagnosticError(value ? "LOOP_VERSION_UNSUPPORTED" : "LOOP_NOT_STARTED"); return value as LoopJournal; }
  async start(input: Pick<LoopJournal, "claim" | "rootSessionID" | "dispatch" | "budgets">): Promise<LoopJournal> {
    let journal!: LoopJournal;
    await withLease(this.root, async () => { const existing = await readJSON(this.journalPath); if (existing && (existing as LoopJournal).mode === "running") throw new DiagnosticError("LOOP_ALREADY_RUNNING"); const iterationID = randomUUID(); journal = { schemaVersion: 1, revision: 1, ...input, mode: "running", iteration: 1, currentIterationID: iterationID, promptID: `opencode2-loop-${input.claim.workID}-1`, noProgress: 0, evidenceCursor: 0, terminalEventIDs: [], childSessionIDs: [] }; await atomicWrite(this.journalPath, `${JSON.stringify(journal)}\n`); });
    await this.effects.prompt(promptFor(journal)); return journal;
  }
  async observeTerminal(input: { id: string; sessionID: string; evidenceCursor: number; descendantsTerminal: boolean; toolsTerminal: boolean }): Promise<void> {
    let nextPrompt: LoopJournal | undefined;
    await withLease(this.root, async () => { const current = await this.status(); if (current.terminalEventIDs.includes(input.id) || current.mode !== "running") return; if (input.sessionID !== current.rootSessionID || !input.descendantsTerminal || !input.toolsTerminal) { const ambiguous = { ...current, revision: current.revision + 1, mode: "ambiguous" as const, stopReason: "LOOP_LINEAGE_AMBIGUOUS", terminalEventIDs: [...current.terminalEventIDs, input.id] }; await atomicWrite(this.journalPath, `${JSON.stringify(ambiguous)}\n`); return; } const noProgress = input.evidenceCursor > current.evidenceCursor ? 0 : current.noProgress + 1; if (noProgress >= current.budgets.maxNoProgress) { await atomicWrite(this.journalPath, `${JSON.stringify({ ...current, revision: current.revision + 1, mode: "stopped", stopReason: "LOOP_NO_PROGRESS_LIMIT", noProgress, terminalEventIDs: [...current.terminalEventIDs, input.id] })}\n`); return; } if (current.iteration >= current.budgets.maxIterations) { await atomicWrite(this.journalPath, `${JSON.stringify({ ...current, revision: current.revision + 1, mode: "stopped", stopReason: "LOOP_ITERATION_LIMIT", terminalEventIDs: [...current.terminalEventIDs, input.id] })}\n`); return; } const iteration = current.iteration + 1; nextPrompt = { ...current, revision: current.revision + 1, iteration, currentIterationID: randomUUID(), promptID: `opencode2-loop-${current.claim.workID}-${iteration}`, noProgress, evidenceCursor: input.evidenceCursor, terminalEventIDs: [...current.terminalEventIDs, input.id] }; await atomicWrite(this.journalPath, `${JSON.stringify(nextPrompt)}\n`); }); if (nextPrompt) await this.effects.prompt(promptFor(nextPrompt));
  }
  async observeUserInput(input: { sessionID: string; inputID: string; type: "user" | "synthetic" }): Promise<void> { if (input.type !== "user") return; await withLease(this.root, async () => { const current = await this.status(); if (current.mode === "running" && input.sessionID === current.rootSessionID && input.inputID !== current.promptID) await atomicWrite(this.journalPath, `${JSON.stringify({ ...current, revision: current.revision + 1, mode: "paused", stopReason: "LOOP_USER_INTERRUPTION" })}\n`); }); }
  async pause(): Promise<void> { await this.setMode("paused", "LOOP_PAUSED"); }
  async resume(): Promise<void> { await this.setMode("running", undefined); const current = await this.status(); await this.effects.prompt(promptFor(current)); }
  async stop(): Promise<void> { const current = await this.status(); await this.setMode("stopping", "LOOP_INTERRUPT_REQUESTED"); await this.effects.interrupt({ sessionID: current.rootSessionID }); }
  private async setMode(mode: LoopJournal["mode"], stopReason: string | undefined): Promise<void> { await withLease(this.root, async () => { const current = await this.status(); const next = { ...current, revision: current.revision + 1, mode, ...(stopReason === undefined ? {} : { stopReason }) }; await atomicWrite(this.journalPath, `${JSON.stringify(next)}\n`); }); }
}
