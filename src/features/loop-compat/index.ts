import type { FeatureRegistration } from "../../plugin/contracts.js";
import { registerLegacyLoopCompatibility } from "./legacy-runtime.mjs";

export const loopCompatibilityFeature: FeatureRegistration = {
  id: "loop-compat",
  register: registerLegacyLoopCompatibility,
};
