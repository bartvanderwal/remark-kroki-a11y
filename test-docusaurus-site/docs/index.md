# remark-kroki-a11y Test Site

This test site demonstrates the accessibility features of the remark-kroki-a11y plugin.

## Quick Examples

### English Sequence Diagram (Alice & Bob)

```kroki imgType="plantuml" imgTitle="Simple sequence diagram" lang="en"
@startuml
Alice -> Bob: Hello Bob!
Bob --> Alice: Hi Alice!
Alice -> Bob: How are you?
Bob --> Alice: I'm fine, thanks!
@enduml
```

### Nederlands Klassendiagram (Strategy Pattern)

```kroki imgType="plantuml" imgTitle="Strategy Pattern" lang="nl"
@startuml
class Woordenlijst {
  -woorden : String[]
  +sorteer() : void
  +setSorteerStrategie(strategie : SorteerStrategie) : void
}
interface SorteerStrategie {
  +sorteer(woorden : String[]) : void
}
class MergeSort {
  +sorteer(woorden : String[]) : void
}
class ShellSort {
  +sorteer(woorden : String[]) : void
}
class QuickSort {
  +sorteer(woorden : String[]) : void
}
Woordenlijst --> "1" SorteerStrategie : huidigeStrategie
MergeSort ..|> SorteerStrategie
ShellSort ..|> SorteerStrategie
QuickSort ..|> SorteerStrategie
@enduml
```

---

## More Test Pages

### English A11y Descriptions

- [PlantUML Class Diagrams (English)](plantuml-class-diagrams-en) - Test class diagrams with English A11y descriptions
- [Domain Models: Larman vs Fowler](domain-model-larman-vs-fowler) - Demonstrates analysis-phase vs design-phase domain modeling styles

### Nederlandse A11y Beschrijvingen

- [PlantUML Klassendiagrammen (Nederlands)](plantuml-class-diagrams-nl) - Test klassendiagrammen met Nederlandse A11y beschrijvingen
- [Domeinmodellen: Larman vs Fowler](domeinmodel-larman-vs-fowler) - Demonstreert analyse-fase vs ontwerp-fase domeinmodellen
