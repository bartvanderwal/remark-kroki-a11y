# ADR: Optional relation legend for developer mode class diagrams

## Status

Accepted

## Context

The plugin now supports a visual mode toggle (`For devs` / `Simpler`) for PlantUML class diagrams.

During review and classroom use, we observed that relation arrow semantics are often assumed as shared knowledge, but this is unreliable in practice. Even experienced developers regularly mix up relation types such as composition (`*-->`) and aggregation (`o-->`).

This aligns with the communication concern highlighted by Simon Brown in _The Lost Art of Software Design_: notation should be explicit enough to support shared understanding, not only author intent.

At the same time, always showing a large legend adds visual noise, especially for diagrams targeted at broader audiences.

## Options

### Option A: No legend support

Keep relation semantics implicit.

### Option B: Always show a full legend

Always render all known UML relation arrows, regardless of what appears in the current diagram.

### Option C: Optional legend, filtered to used relation types

Add an opt-in legend in `For devs` mode only, and show only relation arrows that are actually present in the current diagram.

## Decision

We choose **Option C**.

Implementation choices:

1. Add global option `showDiagramLegend` (default `false`).
2. Add per-diagram flags: `showDiagramLegend` and `hideDiagramLegend`.
3. Show legend only in `For devs` mode.
4. Do not show legend in `Simpler` mode.
5. Generate legend entries from used relation types only (filtered set).

## Consequences

Positive:

- Better design communication for technical audiences.
- Lower onboarding friction for readers less fluent in UML arrow semantics.
- Keeps simple/audience-facing view visually clean.
- Avoids redundant legend entries for unused relation types.

Trade-offs:

- Slightly more transformation logic for class-diagram rendering.
- Legend semantics must stay aligned with relation parser and renderer behavior.

## Actions

1. [x] Add `showDiagramLegend` option and per-diagram override flags.
2. [x] Render relation legend only for `For devs` mode.
3. [x] Filter legend entries to relation arrows present in the diagram.
4. [x] Add/update tests for dev-mode legend behavior and simpler-mode absence.
5. [x] Update README and Docusaurus docs with rationale and usage.

## References

- Brown, S. (2024). _The Lost Art of Software Design_ [Conference talk].
- Brown, S. (n.d.). _The C4 model for visualising software architecture_. https://c4model.com/
- Nygard, M. (2011, November 15). _Documenting architecture decisions_. https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html

---

*Date: 2026-03-12*  
*Author: Bart van der Wal & GitHub Copilot*