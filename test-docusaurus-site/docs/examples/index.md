# Examples

This section contains live examples that demonstrate the remark-kroki-a11y plugin in action. Each page shows diagrams with their automatically generated accessible descriptions.

The following pie charts show general accessibility support for PlantUML and Mermaid diagram types.

<div className="coveragePieRow">
  <div className="coveragePieItem">
    <h3>PlantUML A11y Coverage</h3>

```kroki imgType="mermaid" imgTitle="PlantUML A11y Coverage"
pie showData
    title PlantUML A11y Support
    "With A11y support" : 4
    "Planned/None" : 12
```
  </div>
  <div className="coveragePieItem">
    <h3>Mermaid A11y Coverage</h3>

```kroki imgType="mermaid" imgTitle="Mermaid A11y Coverage"
pie showData
    title Mermaid A11y Support
    "With A11y support" : 2
    "Planned/None" : 13
```
  </div>
</div>

---

## UML Introduction: Red Riding Hood as UML diagrams

- [Red Riding Hood as UML diagrams](/examples/little-red-riding-hood-as-uml-diagrams) - A gentle introduction to (some) UML diagrams
- [Roodkapje in UML diagrammen](/examples/roodkapje-in-uml-diagrammen) - Een toegankelijke introductie in (enkele) UML diagrammen
- [UML Quiz (Multiple Choice)](/examples/uml-quiz-multiple-choice) - Interactive quiz using current component
- [UML Quiz (Syntax)](/examples/uml-quiz-experimental-syntax) - Syntax-based quiz with single, multiple, and open-answer types

## Class Diagrams

### PlantUML

- [PlantUML Class Diagrams (English)](/examples/plantuml-class-diagrams-en) - Test class diagrams with English A11y descriptions
- [PlantUML Klassendiagrammen (Nederlands)](/examples/plantuml-class-diagrams-nl) - Test klassendiagrammen met Nederlandse A11y beschrijvingen

### Mermaid

- [Mermaid Class Diagrams](/examples/mermaid-class-diagrams) - Test Mermaid class diagrams via Kroki with A11y descriptions
- [Mermaid: Kroki vs Theme](/examples/mermaid-theme-comparison) - Compare server-side (Kroki) vs client-side (@docusaurus/theme-mermaid) rendering

## Domain Models

- [Domain Models: Larman vs Fowler](/examples/domain-model-larman-vs-fowler) - Demonstrates analysis-phase vs design-phase domain modeling styles
- [Domeinmodellen: Larman vs Fowler](/examples/domeinmodel-larman-vs-fowler) - Demonstreert analyse-fase vs ontwerp-fase domeinmodellen

## Sequence Diagrams

- [Café Ordering Example](/examples/sequence-diagram-example) - Demonstrates `a11yDescriptionOverride` for diagrams without automatic parsing

## Data Visualizations

- [Mermaid Pie Chart](/examples/mermaid-pie-chart) - Pie charts with custom accessibility descriptions (automatic parsing planned)

---

:::tip Meta
This documentation site is itself a test site for the plugin. Every diagram you see here uses remark-kroki-a11y to generate accessible descriptions!
:::
