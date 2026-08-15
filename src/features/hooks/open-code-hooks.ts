import { DiagnosticError } from "../../core/diagnostics/diagnostic.js";
import type { FeatureCleanup, OpenCodeContext } from "../../plugin/contracts.js";
import { preservePrimaryError, projectRootKey, runAllReverse } from "../../plugin/lifecycle.js";
import { EventCapture, type CaptureInput } from "./event-capture.js";

const activeRoots = new Set<string>();
const string = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

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
    taint: "untrusted-source",
  };
};

export const registerOpenCodeHooks = async (context: OpenCodeContext): Promise<FeatureCleanup> => {
  const root = await projectRootKey(context);
  if (activeRoots.has(root)) return async () => undefined;
  activeRoots.add(root);
  const registrations: Array<{ dispose(): Promise<void> }> = [];
  const abort = new AbortController();
  try {
    const capture = await EventCapture.open(root, { pluginVersion: "0.3.0", hostVersion: context.app.version });
    registrations.push(
      await context.tool.hook("execute.before", async (input: any) => {
        await capture.ingest({
          id: `tool-before:${String(input.id)}`,
          aggregate: `tool:${String(input.id)}`,
          sequence: 1,
          type: "tool.execute.before",
          sessionID: String(input.sessionID),
          messageID: String(input.messageID),
          callID: String(input.id),
          sourceKind: "tool",
          payload: { tool: input.tool, agent: String(input.agent), arguments: "not-retained" },
          taint: "untrusted-tool",
        });
      }),
    );
    registrations.push(
      await context.tool.hook("execute.after", async (input: any) => {
        await capture.ingest({
          id: `tool-after:${String(input.id)}`,
          aggregate: `tool:${String(input.id)}`,
          sequence: 2,
          type: "tool.execute.after",
          sessionID: String(input.sessionID),
          messageID: String(input.messageID),
          callID: String(input.id),
          sourceKind: "tool",
          payload: { tool: input.tool, agent: String(input.agent), status: input.status, result: "not-retained" },
          taint: "untrusted-tool",
        });
      }),
    );
    const events = context.event.subscribe({ signal: abort.signal } as never)[Symbol.asyncIterator]();
    const subscription = (async () => {
      while (!abort.signal.aborted) {
        const next = await events.next();
        if (next.done) break;
        const envelope = eventEnvelope(next.value);
        await capture.ingest(envelope, "redact").catch((error) => {
          if (
            error instanceof DiagnosticError &&
            ["CAPTURE_EVENT_ID_REQUIRED", "CAPTURE_EVENT_ID_INVALID", "CAPTURE_SEQUENCE_INVALID"].includes(error.code)
          )
            return undefined;
          throw error;
        });
      }
    })();
    let cleaned = false;
    return async () => {
      if (cleaned) return;
      cleaned = true;
      try {
        abort.abort();
        await runAllReverse([
          ...registrations.map((registration) => () => registration.dispose()),
          async () => {
            await events.return?.();
            try {
              await subscription;
            } catch (error) {
              if ((error as Error).name !== "AbortError") throw error;
            }
          },
        ]);
      } finally {
        activeRoots.delete(root);
      }
    };
  } catch (error) {
    abort.abort();
    try {
      await runAllReverse(registrations.map((registration) => () => registration.dispose()));
    } catch (cleanupError) {
      throw preservePrimaryError(error, cleanupError);
    } finally {
      activeRoots.delete(root);
    }
    throw error;
  }
};
