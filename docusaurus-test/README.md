# PlantUML Test examples

## Simpel klasse diagram

```kroki imgType="plantuml" imgTitle="Simpel class diagram"
@startuml
class Foo
@enduml
```

## Drie klassen

```kroki imgType="plantuml" imgTitle="Three classes"
@startuml
class Foo
class Bar
class Baz
Foo -- Bar
Bar -- Baz
@enduml
```

## Alleen broncode (geen diagram, alleen uitklapbaar)

```kroki hideDiagram imgType="plantuml" imgTitle="Alleen broncode"
@startuml
class AlleenSource
@enduml
```

## Alleen diagram (geen broncode)

```kroki hideSource imgType="plantuml" imgTitle="Alleen diagram"
@startuml
class AlleenDiagram
@enduml
```

## Diagram + broncode + a11y-beschrijving/tab

```kroki imgType="plantuml" imgTitle="Met beschrijving"
@startuml
class Beschrijving
note right: Dit is een test van de a11y-beschrijving.
@enduml
```
