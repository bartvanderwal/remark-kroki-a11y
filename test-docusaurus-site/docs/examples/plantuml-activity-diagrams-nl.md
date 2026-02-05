---
id: plantuml-activity-diagrams-nl
title: PlantUML Activiteitendiagrammen (Nederlands)
sidebar_label: Activiteitendiagrammen (Nederlands)
description: Test PlantUML activiteitendiagrammen met automatische A11y beschrijvingen
---

# PlantUML Activiteitendiagrammen

Deze pagina test de Nederlandse A11y beschrijvingen voor activiteitendiagrammen, inclusief beslispunten, partities, lussen en parallelle uitvoering.

## Eenvoudig activiteitendiagram met beslispunt

```kroki imgType="plantuml" imgTitle="Graphviz installatie check" lang="nl"
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

## Activiteitendiagram met partities

Partities groeperen gerelateerde activiteiten in benoemde secties met letter-genummerde stappen:

```kroki imgType="plantuml" imgTitle="Software Development Levenscyclus" lang="nl"
@startuml
!theme plain
title Software Development Levenscyclus

start
:Verzamel requirements;

partition "A: Analyse" {
  :Identificeer stakeholders;
  :Maak user stories;
  :Definieer acceptatiecriteria;
}

partition "B: Ontwerp" {
  :Maak domeinmodel;
  :Ontwerp architectuur;
  :Review met team;
}

partition "C: Implementatie" {
  :Schrijf code;
  :Schrijf tests;
  :Code review;
}

stop
@enduml
```

---

## Activiteitendiagram met while lus

Een while lus herhaalt activiteiten zolang een conditie waar is:

```kroki imgType="plantuml" imgTitle="Data verwerkingslus" lang="nl"
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

## Activiteitendiagram met repeat/repeat while (do-while lus)

Een repeat lus voert activiteiten minstens één keer uit en controleert daarna de conditie:

```kroki imgType="plantuml" imgTitle="Item verwerking met repeat" lang="nl"
@startuml
start
:initialiseer;
repeat
  :verwerk item;
  :controleer resultaat;
repeat while (meer items)
:afronden;
stop
@enduml
```

---

## Activiteitendiagram met fork/join (parallelle activiteiten)

Fork en join tonen activiteiten die parallel uitgevoerd worden:

```kroki imgType="plantuml" imgTitle="Parallelle taakuitvoering met fork" lang="nl"
@startuml
start
:Voorbereiden;
fork
  :Taak A;
fork again
  :Taak B;
end fork
:Afronden;
stop
@enduml
```

---

## Activiteitendiagram met split (parallelle activiteiten)

Split is een alternatieve syntax voor parallelle uitvoering:

```kroki imgType="plantuml" imgTitle="Parallelle taakuitvoering met split" lang="nl"
@startuml
start
:Voorbereiden;
split
  :Taak A;
split again
  :Taak B;
end split
:Afronden;
stop
@enduml
```

---

## Activiteitendiagram met partities zonder letterprefix

Als partitienamen niet beginnen met een letterprefix zoals "A:", krijgen stappen gewone nummering die per partitie opnieuw begint:

```kroki imgType="plantuml" imgTitle="Onderzoeksworkflow" lang="nl"
@startuml
start
partition "Informatie verzamelen" {
  :bronnen zoeken;
  :documenten lezen;
}
partition "Uitwerken" {
  :ontwerp maken;
  :implementeren;
}
stop
@enduml
```

---

## Gecombineerd: partities met lussen en beslissingen

Een complexer diagram dat meerdere constructies combineert:

```kroki imgType="plantuml" imgTitle="Sprint workflow" lang="nl"
@startuml
!theme plain
title Sprint Workflow

start
:Sprint planning;

partition "A: Ontwikkeling" {
  :Kies user story;
  while (story taken over?) is (ja)
    :implementeer taak;
    :schrijf tests;
  endwhile (nee)
  :maak pull request;
}

partition "B: Review" {
  if (review goedgekeurd?) then (ja)
    :merge naar main;
  else (nee)
    :verwerk feedback;
  endif
}

:Sprint retrospective;
stop
@enduml
```

---

:::info Over activiteitendiagram ondersteuning
Activiteitendiagrammen ondersteunen de volgende constructies:
- **Beslispunten** (`if/else/endif`) - getoond als beslissingen met ja/nee takken
- **Partities** (`partition "naam" { ... }`) - groepeer activiteiten met gelabelde secties
- **While lussen** (`while/endwhile`) - herhaal zolang conditie waar is
- **Repeat lussen** (`repeat/repeat while`) - do-while: voer minstens één keer uit
- **Fork/join** (`fork/fork again/end fork`) - parallelle uitvoering
- **Split** (`split/split again/end split`) - alternatieve parallelle syntax
- **Notities** (`note right:`) - genegeerd in toegankelijke beschrijving (alleen visueel)
:::
