import { Plugin } from "@opencode-ai/plugin";
import { hookFoundationFeature } from "../features/hooks/index.js";
import { structuredToolsFeature } from "../features/tools/index.js";
import { composeFeatures } from "./compose.js";

export const plugin = Plugin.define({
  id: "iamsterling.opencode2-config",
  setup: composeFeatures([hookFoundationFeature, structuredToolsFeature]),
});
export default plugin;
