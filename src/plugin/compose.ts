import type { FeatureCleanup, FeatureRegistration, OpenCodeContext } from "./contracts.js";

export const composeFeatures =
  (features: readonly FeatureRegistration[]) =>
  async (context: OpenCodeContext): Promise<FeatureCleanup> => {
    const cleanups: FeatureCleanup[] = [];
    try {
      for (const feature of features) {
        const cleanup = await feature.register(context);
        if (cleanup) cleanups.push(cleanup);
      }
    } catch (error) {
      for (const cleanup of cleanups.reverse()) await cleanup();
      throw error;
    }
    let cleaned = false;
    return async () => {
      if (cleaned) return;
      cleaned = true;
      for (const cleanup of cleanups.reverse()) await cleanup();
    };
  };
