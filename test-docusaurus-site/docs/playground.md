---
description: Interactive Kroki test page for quick PlantUML and Mermaid rendering checks.
---

import KrokiPlayground from '@site/src/components/KrokiPlayground';

# Kroki A11Y playground

Gebruik deze pagina om snel diagrammen te testen zonder eerst docs-bestanden aan te passen.

- `Diagram type`: kies `plantuml` of `mermaid`.
- `Kroki base URL`: standaard `https://kroki.io`, lokaal meestal `http://localhost:8000`.
- `Source`: plak of typ je diagramcode en klik op `Render preview`.

> Tip: met lokale Docker Kroki (`docker compose -f docker-compose.kroki.yml up -d`) kun je ook offline of stabieler testen.

<KrokiPlayground />
