---
id: plantuml-activity-diagrams-en
title: PlantUML Activity Diagrams
sidebar_label: Activity Diagrams
description: Test PlantUML activity diagrams with automatic A11y descriptions
---

# PlantUML Activity Diagrams

This page tests the English A11y descriptions for activity diagrams, including decision points, partitions, loops, and parallel execution.

## Simple activity diagram with decision point

```kroki imgType="plantuml" imgTitle="Graphviz installation check" lang="en"
@startuml

start

if (Graphviz installed?) then (yes)
  :process all\ndiagrams;
else (no)
  :process only
  __sequence__ and __activity__ diagrams;
endif

stop

@enduml
```

---

## Activity diagram with partitions

Partitions group related activities into named sections with letter-prefixed step numbering:

```kroki imgType="plantuml" imgTitle="Software Development Lifecycle" lang="en"
@startuml
!theme plain
title Software Development Lifecycle

start
:Gather requirements;

partition "A: Analysis" {
  :Identify stakeholders;
  :Create user stories;
  :Define acceptance criteria;
}

partition "B: Design" {
  :Create domain model;
  :Design architecture;
  :Review with team;
}

partition "C: Implementation" {
  :Write code;
  :Write tests;
  :Code review;
}

stop
@enduml
```

---

## Activity diagram with while loop

A while loop repeats activities as long as a condition is true:

```kroki imgType="plantuml" imgTitle="Data processing loop" lang="en"
@startuml
start
while (data available?) is (yes)
  :read data;
  :process data;
endwhile (no)
stop
@enduml
```

---

## Activity diagram with repeat/repeat while (do-while loop)

A repeat loop executes activities at least once, then checks the condition:

```kroki imgType="plantuml" imgTitle="Item processing with repeat" lang="en"
@startuml
start
:initialize;
repeat
  :process item;
  :check result;
repeat while (more items)
:finalize;
stop
@enduml
```

---

## Activity diagram with fork/join (parallel activities)

Fork and join show activities that execute in parallel:

```kroki imgType="plantuml" imgTitle="Parallel task execution with fork" lang="en"
@startuml
start
:Prepare;
fork
  :Task A;
fork again
  :Task B;
end fork
:Finalize;
stop
@enduml
```

---

## Activity diagram with split (parallel activities)

Split is an alternative syntax for parallel execution:

```kroki imgType="plantuml" imgTitle="Parallel task execution with split" lang="en"
@startuml
start
:Prepare;
split
  :Task A;
split again
  :Task B;
end split
:Finalize;
stop
@enduml
```

---

## Activity diagram with partitions without letter prefix

When partition names don't start with a letter prefix like "A:", steps get plain numbering that resets per partition:

```kroki imgType="plantuml" imgTitle="Research workflow" lang="en"
@startuml
start
partition "Gather information" {
  :find sources;
  :read documents;
}
partition "Write up" {
  :create design;
  :implement;
}
stop
@enduml
```

---

## Combined: partitions with loops and decisions

A more complex diagram combining multiple constructs:

```kroki imgType="plantuml" imgTitle="Sprint workflow" lang="en"
@startuml
!theme plain
title Sprint Workflow

start
:Sprint planning;

partition "A: Development" {
  :Pick user story;
  while (story tasks remaining?) is (yes)
    :implement task;
    :write tests;
  endwhile (no)
  :create pull request;
}

partition "B: Review" {
  if (review approved?) then (yes)
    :merge to main;
  else (no)
    :address feedback;
  endif
}

:Sprint retrospective;
stop
@enduml
```

---

:::info About Activity Diagram Support
Activity diagrams support the following constructs:
- **Decision points** (`if/else/endif`) - shown as decisions with yes/no branches
- **Partitions** (`partition "name" { ... }`) - group activities with labeled sections
- **While loops** (`while/endwhile`) - repeat while condition is true
- **Repeat loops** (`repeat/repeat while`) - do-while: execute at least once
- **Fork/join** (`fork/fork again/end fork`) - parallel execution
- **Split** (`split/split again/end split`) - alternative parallel syntax
- **Notes** (`note right:`) - ignored in accessible description (visual only)
:::
