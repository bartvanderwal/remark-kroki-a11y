# PlantUML Klassendiagrammen (Nederlands)

Deze pagina test de Nederlandse A11y beschrijvingen voor klassendiagrammen.

## Eenvoudig klassendiagram met 1 klasse

```kroki imgType="plantuml" imgTitle="Woordenlijst klasse" lang="nl"
@startuml
class Woordenlijst {
  -woorden : String[]
  +sorteer() : void
}
@enduml
```

## Klassendiagram met 3 klassen en relaties

```kroki imgType="plantuml" imgTitle="Strategy Pattern" lang="nl"
@startuml
interface SorteerStrategie {
  +sorteer(woorden: String[]) : void
}

class Woordenlijst {
  -woorden : String[]
  +sorteer() : void
}

class MergeSort {
  +sorteer(woorden: String[]) : void
}

Woordenlijst --> SorteerStrategie : huidigeStrategie
MergeSort ..|> SorteerStrategie
@enduml
```
