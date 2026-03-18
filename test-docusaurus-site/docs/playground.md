---
description: Interactive Kroki test page for quick PlantUML and Mermaid rendering checks.
---

import KrokiPlayground from '@site/src/components/KrokiPlayground';

# Kroki A11Y playground

<KrokiPlayground />

Use this page to quickly test diagrams without editing documentation files first.

- `Diagram type`: choose `plantuml` or `mermaid`.
- `Kroki base URL`: default is `https://kroki.io`, local is usually `http://localhost:8000`.
- `Source`: paste or type your diagram code and click `Render preview`.

> Tip: with local Docker Kroki (`docker compose -f docker-compose.kroki.yml up -d`), you can also test offline or with more stable rendering.
