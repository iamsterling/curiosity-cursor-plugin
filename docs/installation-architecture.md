# Installation architecture

No installation cutover is part of this research split. The inherited installer implementation is tested, but this repository does not run it against operator configuration.

A future separately reviewed Cursor design must define its own packaging, integrity, placement, duplicate-load prevention, rollback, and any migration policy. Until then:

- the current OpenCode research plugin emits only redacted capture state under `.opencode/curiosity-cursor-plugin/capture/v1/`;
- old `.opencode/opencode-loop/` and `.opencode/opencode2-config/` state is read by neither runtime nor bootstrap tooling;
- global configuration and installed plugins remain untouched;
- no Cursor installation or conversion is claimed.
