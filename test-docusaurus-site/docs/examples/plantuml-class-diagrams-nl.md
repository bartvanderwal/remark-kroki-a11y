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

## Uitgebreid klassendiagram met 5 klassen en 4 relaties

```kroki imgType="plantuml" imgTitle="Uitgebreid Strategy Pattern" lang="nl"
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
Woordenlijst --> "1" SorteerStrategie : -huidigeStrategie
MergeSort ..|> SorteerStrategie
ShellSort ..|> SorteerStrategie
QuickSort ..|> SorteerStrategie
note right of Woordenlijst
public void sorteer() {
  huidigeStrategie.sorteer(woorden);
}
end note
@enduml
```

**Screenreader tekst (Nederlands):**
Klassendiagram met 5 klassen en 4 relaties.
Klassen:
- Klasse Woordenlijst met:
  - Private attribuut woorden van type String Array
  - Publieke methode sorteer, zonder parameters, return type void
  - Publieke methode setSorteerStrategie met parameter strategie van type SorteerStrategie, return type void
- Interface SorteerStrategie met publieke methode sorteer met parameter woorden van type String Array, return type void
- Klasse MergeSort met publieke methode sorteer met parameter woorden van type String Array, return type void
- Klasse ShellSort met publieke methode sorteer met parameter woorden van type String Array, return type void
- Klasse QuickSort met publieke methode sorteer met parameter woorden van type String Array, return type void
Relaties:
- Woordenlijst heeft een associatie naar SorteerStrategie, met naam huidigeStrategie, multipliciteit 1
- MergeSort implementeert interface SorteerStrategie
- ShellSort implementeert interface SorteerStrategie
- QuickSort implementeert interface SorteerStrategie
Notities:
- Bij klasse Woordenlijst: "De methode sorteer roept huidigeStrategie punt sorteer aan met woorden als parameter"
