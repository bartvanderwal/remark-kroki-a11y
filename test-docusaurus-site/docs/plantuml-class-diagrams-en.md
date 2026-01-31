# PlantUML Class Diagrams (English)

This page tests the English A11y descriptions for class diagrams.

## Simple class diagram with 1 class

```kroki imgType="plantuml" imgTitle="WordList class" lang="en"
@startuml
class WordList {
  -words : String[]
  +sort() : void
}
@enduml
```

## Class diagram with 3 classes and relationships

```kroki imgType="plantuml" imgTitle="Strategy Pattern" lang="en"
@startuml
interface SortStrategy {
  +sort(words: String[]) : void
}

class WordList {
  -words : String[]
  +sort() : void
}

class MergeSort {
  +sort(words: String[]) : void
}

WordList --> SortStrategy : currentStrategy
MergeSort ..|> SortStrategy
@enduml
```

## Extended class diagram with 5 classes and 4 relationships

```kroki imgType="plantuml" imgTitle="Extended Strategy Pattern" lang="en"
@startuml
class WordList {
  -words : String[]
  +sort() : void
  +setSortStrategy(strategy : SortStrategy) : void
}
interface SortStrategy {
  +sort(words : String[]) : void
}
class MergeSort {
  +sort(words : String[]) : void
}
class ShellSort {
  +sort(words : String[]) : void
}
class QuickSort {
  +sort(words : String[]) : void
}
WordList --> "1" SortStrategy : -currentStrategy
MergeSort ..|> SortStrategy
ShellSort ..|> SortStrategy
QuickSort ..|> SortStrategy
note right of WordList
public void sort() {
  currentStrategy.sort(words);
}
end note
@enduml
```

**Screen reader text (English):**

Class diagram with 5 classes and 4 relationships.

Classes:

- Class WordList with:
  - Private attribute words of type String Array
  - Public method sort, without parameters, return type void
  - Public method setSortStrategy with parameter strategy of type SortStrategy, return type void
- Interface SortStrategy with public method sort with parameter words of type String Array, return type void
- Class MergeSort with public method sort with parameter words of type String Array, return type void
- Class ShellSort with public method sort with parameter words of type String Array, return type void
- Class QuickSort with public method sort with parameter words of type String Array, return type void
Relations:
- WordList has an association-relationship named 'currentStrategy' with SortStrategy, multiplicity 1
- MergeSort implements interface SortStrategy
- ShellSort implements interface SortStrategy
- QuickSort implements interface SortStrategy
Notes:
- At class WordList: "The sort method calls currentStrategy.sort with words as parameter"
