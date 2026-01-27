# PlantUML Example Scenarios

This file contains various PlantUML diagram scenarios for manual plugin testing in Docusaurus.

## Simple class diagram

```kroki imgType="plantuml" imgTitle="Simple class diagram"
@startuml
class Foo
@enduml
```

## Class diagram with three classes

```kroki imgType="plantuml" imgTitle="Three classes"
@startuml
class Foo
class Bar
class Baz
Foo -- Bar
Bar -- Baz
@enduml
```

## Source code only (no diagram, just expandable)

```kroki hideDiagram imgType="plantuml" imgTitle="Source only"
@startuml
class SourceOnly
@enduml
```

## Diagram only (no source code)

```kroki hideSource imgType="plantuml" imgTitle="Diagram only"
@startuml
class DiagramOnly
@enduml
```

## Diagram + source code + a11y description/tab

```kroki imgType="plantuml" imgTitle="With description"
@startuml
class Description
note right: This is a test of the a11y description.
@enduml
```
