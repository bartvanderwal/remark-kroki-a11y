# ADR 0015: `src` attribute resolution and source-tab fidelity

## Status

Proposed

## Context

We introduced a component-level `src="...puml"` attribute for `kroki` code blocks to avoid duplicating large PlantUML snippets inline.

Two requirements must be satisfied:

1. Path semantics should feel natural for authors: `src` should resolve relative to the Markdown file (similar to images and other local references).
2. The source tab shown to users should be faithful: it should show actual diagram source content, not an internal wrapper such as:
   - `@startuml`
   - `!include ...`
   - `@enduml`

## Options

### Option A: Keep `src` as PlantUML `!include` wrapper only

- Plugin transforms `src` into `!include ...` and sends wrapper to Kroki.
- File resolution is delegated to PlantUML/Kroki runtime include-path.
- No local read required in plugin core.

Pros:

- Simple runtime model.
- Aligns with native PlantUML include mechanics.

Cons:

- Authoring path semantics are not Markdown-local by default.
- Source tab fidelity is harder: wrapper can leak to UI.
- Requires explicit Kroki include mount/config for local files.

### Option B: Resolve and load local `.puml` from filesystem in plugin (relative to Markdown file)

- Plugin resolves `src` relative to the current `.md/.mdx` file.
- Plugin reads file contents directly.
- Kroki receives expanded content (not include wrapper).
- Source tab and a11y parsing use the same expanded content.

Pros:

- Predictable authoring semantics (relative to document).
- Source tab is always faithful.
- No dependency on Kroki include-path for local `src`.

Cons:

- Plugin does build-time file I/O.
- Needs clear safety and path validation rules.
- Remote `src` behavior must be explicitly defined.

### Option C: Hybrid

- Render path uses `!include` wrapper.
- UI/a11y path tries to read expanded source locally when possible.

Pros:

- Partial compatibility with existing include-path setups.
- Lower migration impact.

Cons:

- Two execution models for one feature.
- More edge cases and confusion.
- Harder to reason about and test.

## Decision

Choose **Option B**.

`src` should be treated as a plugin-level include mechanism with Markdown-relative path semantics.
The plugin should read the referenced `.puml` file directly and use that content as the single source of truth for:

- Kroki rendering input
- Source tab output
- A11y parsing

PlantUML `!include` remains available to authors as native PlantUML syntax inside the loaded file, but is not the core mechanism behind `src`.

`src` paths are resolved relative to the `.md/.mdx` file that contains the `kroki` block.

## Consequences

Positive:

- Consistent and intuitive author experience.
- Faithful source display by design.
- A11y parser sees the same content as users in source tab.

Negative:

- Additional I/O and validation logic in plugin.
- Need to define and enforce path constraints.
- Potential migration work for existing examples that rely on Kroki include-path mounts.
