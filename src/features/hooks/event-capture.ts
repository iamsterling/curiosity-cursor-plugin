import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { digestCanonical } from "../../core/canonical/index.js";
import { atomicWrite, listJSON, withLease } from "../../platform/persistence/atomic-store.js";

export interface CaptureInput {
  readonly id: string;
  readonly aggregate: string;
  readonly sequence: number;
  readonly type: string;
  readonly sessionID?: string;
  readonly rootSessionID?: string;
  readonly parentSessionID?: string;
  readonly projectID?: string;
  readonly workspaceID?: string;
  readonly repositoryID?: string;
  readonly messageID?: string;
  readonly callID?: string;
  readonly executionID?: string;
  readonly sourceKind: string;
  readonly causationID?: string;
  readonly correlationID?: string;
  readonly payload?: unknown;
  readonly taint?: "trusted-metadata" | "untrusted-source" | "untrusted-tool" | "plugin-self";
}
interface Envelope extends Omit<CaptureInput, "payload"> { readonly schemaVersion: 1; readonly payloadDigest: string; readonly taint: "trusted-metadata" | "untrusted-source" | "untrusted-tool" | "plugin-self"; readonly pluginVersion: string; readonly hostVersion: string; readonly watermark: number }
export interface CaptureGap { readonly aggregate: string; readonly from: number; readonly to: number }

export class EventCapture {
  private constructor(readonly root: string, readonly versions: { pluginVersion: string; hostVersion: string }) {}
  static async open(projectDirectory: string, versions: { pluginVersion: string; hostVersion: string }): Promise<EventCapture> {
    const root = path.join(projectDirectory, ".opencode/opencode2-config/capture/v1"); await mkdir(path.join(root, "events"), { recursive: true }); return new EventCapture(root, versions);
  }
  async snapshot(): Promise<{ events: Envelope[]; gaps: CaptureGap[] }> {
    const events: Envelope[] = [];
    for (const name of await listJSON(path.join(this.root, "events"))) events.push(JSON.parse(await readFile(path.join(this.root, "events", name), "utf8")) as Envelope);
    let gaps: CaptureGap[] = [];
    try { gaps = JSON.parse(await readFile(path.join(this.root, "gaps.json"), "utf8")) as CaptureGap[]; } catch {}
    return { events, gaps };
  }
  async ingest(input: CaptureInput): Promise<{ status: "accepted" | "duplicate" | "collision"; gaps: CaptureGap[] }> {
    return withLease(this.root, async () => {
      const snapshot = await this.snapshot(); const existing = snapshot.events.find((item) => item.id === input.id); const payloadDigest = digestCanonical(input.payload ?? null);
      if (existing) return { status: existing.payloadDigest === payloadDigest && existing.type === input.type ? "duplicate" : "collision", gaps: snapshot.gaps };
      const aggregateEvents = snapshot.events.filter((item) => item.aggregate === input.aggregate); const watermark = Math.max(0, ...aggregateEvents.map((item) => item.sequence)); const gaps = [...snapshot.gaps];
      if (input.sequence > watermark + 1) gaps.push({ aggregate: input.aggregate, from: watermark + 1, to: input.sequence - 1 });
      const envelope: Envelope = { ...input, payload: undefined, schemaVersion: 1, payloadDigest, taint: input.taint ?? "untrusted-source", pluginVersion: this.versions.pluginVersion, hostVersion: this.versions.hostVersion, watermark: Math.max(watermark, input.sequence) } as Envelope;
      await atomicWrite(path.join(this.root, "events", `${input.id}.json`), `${JSON.stringify(envelope)}\n`); await atomicWrite(path.join(this.root, "gaps.json"), `${JSON.stringify(gaps)}\n`);
      return { status: "accepted", gaps };
    });
  }
}
