# Installation architecture

No installation cutover is part of this repository. The inherited OpenCode installer implementation is tested, but this repository does not run it against operator configuration.

Native Cursor Phase 0 and Phase 1 support only an opt-in local CLI load from the repository root:

```sh
agent --plugin-dir "$PWD"
```

The option is documented in Cursor's [CLI parameter reference](https://cursor.com/docs/cli/reference/parameters); the local directory contains the [Cursor Plugin manifest](https://cursor.com/docs/reference/plugins). Stopping the argument on later invocations is operational rollback. This path does not copy files, modify global configuration, install the plugin, or establish persistent duplicate-load prevention. No live smoke was run.

A future separately reviewed Cursor design must define packaging, integrity, placement, duplicate-load prevention, rollback beyond invocation scope, and any migration policy. Until then:

- the current OpenCode research plugin emits only redacted capture state under `.opencode/curiosity-cursor-plugin/capture/v1/`;
- old `.opencode/opencode-loop/` and `.opencode/opencode2-config/` state is read by neither runtime nor bootstrap tooling;
- global configuration and installed plugins remain untouched;
- the existing OpenCode research surface coexists and is not cut over;
- no Cursor installation, marketplace publication, or conversion beyond the four read-only native agents is claimed.
