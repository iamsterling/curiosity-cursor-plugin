import { Plugin } from "@opencode-ai/plugin";
import { hookFoundationFeature } from "../features/hooks/index.js";
import { structuredToolsFeature } from "../features/tools/index.js";
import { composeFeatures } from "./compose.js";

const activeSetups = new Set<string>();
const composed = composeFeatures([hookFoundationFeature, structuredToolsFeature]);
const setupOnce = async (context: Parameters<typeof composed>[0]) => {
  const key = typeof context.options.directory === "string" ? context.options.directory : "default";
  if (activeSetups.has(key)) return () => undefined;
  activeSetups.add(key);
  try {
    const cleanup = await composed(context);
    return async () => {
      try {
        await cleanup();
      } finally {
        activeSetups.delete(key);
      }
    };
  } catch (error) {
    activeSetups.delete(key);
    throw error;
  }
};

export const plugin = Plugin.define({
  id: "iamsterling.opencode2-config",
  setup: setupOnce,
});
export default plugin;
