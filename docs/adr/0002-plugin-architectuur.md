# ADR: Keuze voor plugin-architectuur (remark, MDX, JSX)

## Status

Proposed

## Context

Voor het genereren van toegankelijke (a11y) beschrijvingen van PlantUML- en Mermaid-diagrammen in Markdown-documentatie zijn er verschillende integratie-opties:

- **remark plugin (plain JavaScript):**
  - Kan direct Markdown AST bewerken tijdens de build pipeline.
  - Werkt in veel statische site generators (zoals Docusaurus).
  - Geen afhankelijkheid van React of MDX.
- **MDX/JSX plugin (met React componenten):**
  - Maakt het mogelijk om interactieve of dynamische React-componenten (zoals tabs) in te voegen.
  - Kan a11y-functionaliteit combineren met visuele UI-componenten.
  - Vereist MDX-ondersteuning in de documentatie-pipeline.

Alternatieven zijn o.a. custom loaders, of directe integratie in de diagramtools zelf (PlantUML/Mermaid), maar dat valt buiten de scope van deze codebase.

## Decision

We kiezen voor een **remark plugin in plain JavaScript** als basis, omdat:

- Dit het breedst inzetbaar is in bestaande Markdown pipelines.
- Het geen afhankelijkheid introduceert op React/MDX.
- Het eenvoudig is te testen en te hergebruiken in verschillende contexten.

Voor specifieke use-cases (zoals tab-componenten in Docusaurus) kan aanvullend een MDX/JSX-plugin of React-component worden ontwikkeld, maar dit is optioneel en afhankelijk van de consumerende site.

## Consequenties

- De a11y-functionaliteit is breed inzetbaar in Markdown-omgevingen.
- Voor interactieve UI (zoals tabs) is aanvullende integratie nodig in de consumerende site (bijvoorbeeld via MDX/JSX of React-componenten).
- Maximale herbruikbaarheid wordt bereikt door de kern als plain JavaScript plugin te houden, met optionele uitbreidingen voor specifieke frameworks.
- Op termijn is het wenselijk dat a11y standaard wordt ingebouwd in PlantUML en Mermaid zelf, conform wetgeving en best practices.

## Bronnen

- [Bijectie (Wikipedia)](https://nl.wikipedia.org/wiki/Bijectie)
- [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

*Datum: 2026-01-31*
*Auteur: Bart van der Wal & GitHub Copilot*
