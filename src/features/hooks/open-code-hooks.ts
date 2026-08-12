import path from "node:path";
import { digestCanonical } from "../../core/canonical/index.js";
import { DiagnosticError } from "../../core/diagnostics/diagnostic.js";
import { Ledger } from "../ledger/index.js";
import { NativeLoopEngine } from "../loop-engine/index.js";
import type { FeatureCleanup, OpenCodeContext } from "../../plugin/contracts.js";
import { boundedLedgerContext, projectLedgerContext } from "./context-projection.js";
import { EventCapture, type CaptureInput } from "./event-capture.js";

const activeRoots = new Set<string>();
const string = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const rootFor = (context: OpenCodeContext): string => {
  const configured = string(context.options.directory) ?? string(context.options.projectDirectory) ?? process.cwd();
  return path.resolve(configured);
};
export const eventEnvelope = (raw: unknown): CaptureInput => {
  const event = object(raw);
  const data = object(event.data);
  const durable = object(event.durable);
  const id = string(event.id) ?? string(data.eventID);
  const type = string(event.type) ?? "unknown";
  const callID = string(data.callID) ?? string(data.toolCallID);
  const cancelledTool = type === "tool.execute.cancelled" && callID;
  const aggregate =
    string(durable.aggregateID) ??
    string(event.aggregateID) ??
    (cancelledTool ? `tool:${callID}` : undefined) ??
    string(data.sessionID) ??
    "host";
  const sequence =
    cancelledTool && !durable.aggregateID && !event.aggregateID ? 2 : Number(durable.seq ?? event.seq ?? data.seq);
  const optional = Object.fromEntries(
    Object.entries({
      sessionID: string(data.sessionID),
      rootSessionID: string(data.rootSessionID),
      parentSessionID: string(data.parentSessionID),
      messageID: string(data.messageID),
      callID,
      executionID: string(data.executionID),
      causationID: string(data.causationID),
      correlationID: string(data.correlationID),
    }).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
  return {
    id: id ?? "",
    aggregate,
    sequence,
    type,
    ...optional,
    sourceKind: "host",
    payload: event,
    taint: "untrusted-source" as const,
  };
};

export const registerOpenCodeHooks = async (context: OpenCodeContext): Promise<FeatureCleanup> => {
  const root = rootFor(context);
  if (activeRoots.has(root)) return () => undefined;
  activeRoots.add(root);
  const registrations: Array<{ dispose(): Promise<void> }> = [];
  const abort = new AbortController();
  const ledger = await Ledger.open(root);
  const capture = await EventCapture.open(root, { pluginVersion: "0.1.0", hostVersion: context.app.version });
  const loop = await NativeLoopEngine.open(root, {
    prompt: async (input) => context.session.prompt(input as never),
    interrupt: async (input) => context.session.interrupt(input as never),
  });
  registrations.push(
    await context.session.hook("context", async (input) => {
      const projection = await ledger.contextProjection(String(input.sessionID));
      input.system.push({
        text: boundedLedgerContext(projectLedgerContext({ sessionID: String(input.sessionID), ...projection })),
      } as never);
    }),
  );
  registrations.push(
    await context.tool.hook("execute.before", async (input) => {
      await capture.ingest({
        id: `tool-before:${String(input.id)}`,
        aggregate: `tool:${String(input.id)}`,
        sequence: 1,
        type: "tool.execute.before",
        sessionID: String(input.sessionID),
        messageID: String(input.messageID),
        callID: String(input.id),
        sourceKind: "tool",
        payload: { tool: input.tool, agent: String(input.agent), inputDigest: digestCanonical(input.input) },
        taint: "untrusted-tool",
      });
    }),
  );
  registrations.push(
    await context.tool.hook("execute.after", async (input) => {
      await capture.ingest({
        id: `tool-after:${String(input.id)}`,
        aggregate: `tool:${String(input.id)}`,
        sequence: 2,
        type: "tool.execute.after",
        sessionID: String(input.sessionID),
        messageID: String(input.messageID),
        callID: String(input.id),
        sourceKind: "tool",
        payload: {
          tool: input.tool,
          agent: String(input.agent),
          status: input.status,
          resultDigest: digestCanonical(input.status === "completed" ? input.result : input.error),
        },
        taint: "untrusted-tool",
      });
    }),
  );
  const subscription = (async () => {
    for await (const raw of context.event.subscribe({ signal: abort.signal })) {
      const envelope = eventEnvelope(raw);
      const captured = await capture.ingest(envelope);
      if (
        ["duplicate", "collision"].includes(captured.status) ||
        envelope.correlationID?.startsWith("opencode2-config:self:")
      )
        continue;
      const event = object(raw);
      const data = object(event.data);
      if (envelope.type === "session.input.admitted")
        await loop
          .observeUserInput({
            sessionID: envelope.sessionID ?? "",
            inputID: string(data.inputID) ?? envelope.id,
            type: object(data.input).type === "synthetic" ? "synthetic" : "user",
          })
          .catch((error) => {
            if (!(error instanceof DiagnosticError) || error.code !== "LOOP_NOT_STARTED") throw error;
          });
      if (
        ["session.execution.succeeded", "session.execution.failed", "session.execution.interrupted"].includes(
          envelope.type,
        )
      )
        await loop
          .observeTerminal({
            id: envelope.id,
            sessionID: envelope.sessionID ?? "",
            evidenceCursor: Number(data.evidenceCursor ?? 0),
            descendantsTerminal: data.descendantsTerminal === true,
            toolsTerminal: data.toolsTerminal === true,
          })
          .catch((error) => {
            if (!(error instanceof DiagnosticError) || error.code !== "LOOP_NOT_STARTED") throw error;
          });
    }
  })();
  let cleaned = false;
  return async () => {
    if (cleaned) return;
    cleaned = true;
    abort.abort();
    try {
      await subscription;
    } catch (error) {
      if ((error as Error).name !== "AbortError") throw error;
    }
    for (const registration of registrations.reverse()) await registration.dispose();
    activeRoots.delete(root);
  };
};
