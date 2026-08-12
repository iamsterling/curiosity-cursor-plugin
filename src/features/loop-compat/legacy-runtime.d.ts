import type { FeatureCleanup, OpenCodeContext } from "../../plugin/contracts.js";
export function registerLegacyLoopCompatibility(context: OpenCodeContext): Promise<FeatureCleanup>;
export function dispatchEvent(client: unknown, event: unknown): Promise<void>;
export function applyRuntimeContractRetry(job: unknown, retry: unknown): unknown;
export function setGoalComplete(...args: unknown[]): Promise<unknown>;
export function setGoalProgress(...args: unknown[]): Promise<unknown>;
