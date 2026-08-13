import { Plugin } from "@opencode-ai/plugin";
import { hookFoundationFeature } from "../features/hooks/index.js";
import { structuredToolsFeature } from "../features/tools/index.js";
import { composeFeatures } from "./compose.js";
import { projectRootKey } from "./lifecycle.js";

const activeSetups = new Set<string>();
const composed = composeFeatures([hookFoundationFeature, structuredToolsFeature]);
const setup = async (context: Parameters<typeof composed>[0]) => {
  const key = await projectRootKey(context);
  if (activeSetups.has(key)) return () => undefined;
  activeSetups.add(key);
  try {
    const cleanup = await composed(context);
    let cleaned = false;
    return async () => {
      if (cleaned) return;
      cleaned = true;
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

export default Plugin.define({
  id: "iamsterling.opencode2-config",
  setup,
});
