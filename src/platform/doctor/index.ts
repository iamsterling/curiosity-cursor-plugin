import type { Diagnostic } from "../../core/diagnostics/diagnostic.js";

export interface DoctorInput {
  readonly pluginApiVersion: string;
  readonly hostVersion: string;
  readonly setupCount: number;
  readonly agents: Readonly<Record<string, { enabled: boolean; model?: string }>>;
  readonly defaultAgent?: string;
  readonly subagentDepth?: number;
  readonly hooks: readonly string[];
  readonly directShellDetected: boolean;
}
const exactPin = "0.0.0-next-17125";
export const diagnose = (input: DoctorInput): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  if (input.pluginApiVersion !== exactPin) diagnostics.push({ code: "DOCTOR_PLUGIN_API_PIN_MISMATCH" });
  if (!/^0\.0\.0-next-\d+$/.test(input.hostVersion)) diagnostics.push({ code: "DOCTOR_HOST_VERSION_UNSUPPORTED" });
  if (input.setupCount > 1) diagnostics.push({ code: "DOCTOR_DUPLICATE_LOAD_DETECTED" });
  if (!input.defaultAgent || !input.agents[input.defaultAgent]?.enabled)
    diagnostics.push({ code: "DOCTOR_DEFAULT_AGENT_INVALID" });
  if (Object.values(input.agents).some((agent) => agent.enabled && (!agent.model || !agent.model.includes("/"))))
    diagnostics.push({ code: "DOCTOR_MODEL_ROUTE_UNQUALIFIED" });
  if (input.subagentDepth !== 3) diagnostics.push({ code: "DOCTOR_SUBAGENT_DEPTH_UNPROVEN" });
  for (const hook of ["session.context", "tool.execute.before", "tool.execute.after", "event.subscribe"])
    if (!input.hooks.includes(hook)) diagnostics.push({ code: "DOCTOR_HOOK_MISSING", path: hook });
  if (input.directShellDetected) diagnostics.push({ code: "DOCTOR_DIRECT_SHELL_PROHIBITED" });
  diagnostics.push({ code: "DOCTOR_NATIVE_CHILD_LINEAGE_UNSUPPORTED" });
  diagnostics.push({ code: "DOCTOR_FILESYSTEM_AUTHORITY_BOUNDED" });
  diagnostics.push({ code: "DOCTOR_BOUNDED_ROOT_ACTIVATION_DISABLED" });
  return diagnostics;
};
