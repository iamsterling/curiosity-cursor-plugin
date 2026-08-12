# Mandatory native-loop real-host probes

**Proposed; blocking native semantics.** Observe on the exact pinned OpenCode host: (1) event-driven continuation without command markers, (2) parent/child session creation and completion correlation, (3) interrupt versus completion races, (4) plugin cleanup/reload with no leaked subscription or work, and (5) compaction start/end and post-compaction continuation. Record raw event traces and stable outcomes. Do not infer APIs from the compatibility daemon or introduce polling.
