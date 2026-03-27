---
description: Interactive Kroki test page for quick PlantUML and Mermaid rendering checks.
title: Kroki A11Y playground
---

import KrokiPlayground from '@site/src/components/KrokiPlayground';

<KrokiPlayground />

## Playground options

Use the controls in the playground to demo this behavior live:

- `showDiagramModeToggle`: enables `For devs` / `Simpler` for PlantUML class diagrams.
- `showDiagramLegend`: adds a relation legend in `For devs` mode only.
- `hideSource` and `hideA11y`: simulate plugin tab visibility choices.
- `Diagram type` and `Kroki server`: switch between PlantUML/Mermaid and endpoint presets.

> Tip: with local Docker Kroki (`docker compose -f docker-compose.kroki.yml up -d`), you can test offline and keep rendering stable during demos.

## Class diagrams like domain models now in simpler and 'for devs'

This playground supports visual mode switching for **PlantUML class diagrams**:

- `For devs`: enriched technical view for implementation and design decisions.
- `Simpler`: reduced visual complexity for communication with domain experts and other non-technical stakeholders.

This helps with **situational disabilities** too. You can keep discussing domain concepts in `Simpler`, while still evolving technical precision in `For devs` mode in an Agile way. Best of Both worlds!

## What changes between modes?

In `For devs`, you can keep implementation-level detail visible, such as:

- richer attribute typing and technical type choices;
- aggregate boundary and aggregate-reference modeling choices;
- more specific relation intent (for example dependency vs association);
- optional relation legend (`showDiagramLegend`) for technical readers.

In `Simpler`, the visual is intentionally reduced to support fast, shared understanding:

- id-focused and heavy technical details are minimized;
- relation complexity is collapsed to a simpler representation;
- language stays closer to domain conversation.
