/** OpenCode-native execution only: no timers, polling, daemon, lifecycle authority, or evidence decisions. */
export interface LoopContinuationPort {
  continueParent(input: { readonly sessionID: string; readonly prompt: string }): Promise<void>;
  startChild(input: {
    readonly parentSessionID: string;
    readonly prompt: string;
  }): Promise<{ readonly sessionID: string }>;
  interrupt(input: { readonly sessionID: string }): Promise<void>;
}
export interface IterationBudget {
  readonly maximumIterations: number;
}
