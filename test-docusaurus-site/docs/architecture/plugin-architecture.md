# remark-kroki-a11y Plugin Architectuur

Dit component diagram toont hoe het remark-kroki-a11y plugin meerdere diagram-as-text formaten ondersteunt en omzet naar toegankelijke beschrijvingen.

## C4 Component Diagram

```kroki imgType="plantuml" imgTitle="C4 Component Diagram: remark-kroki-a11y Plugin" lang="en" customDescription="C4 component diagram showing the remark-kroki-a11y plugin architecture. Contains adapters for Mermaid, PlantUML, and GraphViz that convert to an internal PlantUML-based representation. The IR feeds into a Description Generator and ARIA Generator for accessible output."
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

title Component Diagram: remark-kroki-a11y Plugin

Container_Boundary(plugin, "remark-kroki-a11y Plugin") {
    Component(mermaidAdapter, "MermaidAdapter", "JavaScript", "Parses Mermaid syntax")
    Component(plantumlAdapter, "PlantUMLAdapter", "JavaScript", "Parses PlantUML syntax")
    Component(graphvizAdapter, "GraphVizAdapter", "JavaScript", "Parses GraphViz DOT syntax")

    Component(ir, "Internal Representation", "JavaScript Object", "PlantUML-based data structure")

    Component(descGenerator, "Description Generator", "JavaScript", "Generates accessible text")
    Component(ariaGenerator, "ARIA Generator", "JavaScript", "Generates ARIA landmarks")
}

Rel(mermaidAdapter, ir, "adapts to", "parsed structure")
Rel(plantumlAdapter, ir, "adapts to", "parsed structure")
Rel(graphvizAdapter, ir, "adapts to", "parsed structure")

Rel(ir, descGenerator, "provides data to")
Rel(ir, ariaGenerator, "provides data to")

SHOW_LEGEND()
@enduml
```

## Architectuurbeslissingen

- **Adapter Pattern** - Elke parser "adapteert" zijn bronformaat naar een gemeenschappelijke interne representatie
- **PlantUML als IR** - Zie ADR-0006 in de `docs/adr/` folder van de repository

## Voordelen

1. **Uitbreidbaar** - Nieuwe formaten toevoegen zonder bestaande code te wijzigen
2. **Consistente output** - Zelfde diagram = zelfde beschrijving, ongeacht bronformaat
3. **Testbaar** - Elke component apart te testen

## C4 Library

De C4-PlantUML library is lokaal opgeslagen in `plantuml-libs/C4/` voor stabiliteit (geen CDN-afhankelijkheid).

Bron: [plantuml-stdlib/C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)

## Referenties

- ADR-0006: PlantUML als interne standaard (zie `docs/adr/` in de repository)
