import { Plugin } from "@opencode-ai/plugin";
import { loopCompatibilityFeature } from "../features/loop-compat/index.js";
import { composeFeatures } from "./compose.js";

export const plugin = Plugin.define({
  id: "iamsterling.opencode2-config",
  setup: composeFeatures([loopCompatibilityFeature]),
});
export default plugin;
