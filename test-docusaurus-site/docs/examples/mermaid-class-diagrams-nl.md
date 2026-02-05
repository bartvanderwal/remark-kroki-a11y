---
id: mermaid-class-diagrams-nl
title: Mermaid Klassendiagrammen (Nederlands)
sidebar_label: Klassendiagrammen (Nederlands)
description: Test Mermaid klassendiagrammen met automatische A11y beschrijvingen via Kroki
---

# Mermaid Klassendiagrammen

Deze pagina test Mermaid klassendiagrammen gerenderd via Kroki, met automatisch gegenereerde Nederlandstalige natuurlijke taal beschrijvingen.

## Strategy Pattern (Mermaid via Kroki)

Hetzelfde Strategy Pattern voorbeeld als PlantUML, maar geschreven in Mermaid syntax:

```kroki imgType="mermaid" imgTitle="Strategy Pattern (Mermaid)" lang="nl"
classDiagram
    class Woordenlijst {
        -String[] woorden
        +sorteer() void
        +setSorteerStrategie(strategie) void
    }
    class SorteerStrategie {
        <<interface>>
        +sorteer(woorden) void
    }
    class MergeSort {
        +sorteer(woorden) void
    }
    class ShellSort {
        +sorteer(woorden) void
    }
    class QuickSort {
        +sorteer(woorden) void
    }
    Woordenlijst --> SorteerStrategie : huidigeStrategie
    SorteerStrategie <|.. MergeSort
    SorteerStrategie <|.. ShellSort
    SorteerStrategie <|.. QuickSort
```

## Eenvoudige dierenhiërarchie

Een eenvoudig overervingsvoorbeeld:

```kroki imgType="mermaid" imgTitle="Dierenhiërarchie" lang="nl"
classDiagram
    class Dier {
        +String naam
        +int leeftijd
        +maakGeluid() void
    }
    class Hond {
        +String ras
        +blaf() void
    }
    class Kat {
        +String kleur
        +miauw() void
    }
    Dier <|-- Hond
    Dier <|-- Kat
```

## E-commerce Domeinmodel

Een complexer domeinmodel:

```kroki imgType="mermaid" imgTitle="E-commerce Domein" lang="nl"
classDiagram
    class Klant {
        -String id
        -String naam
        -String email
        +plaatsBestelling(items) Bestelling
    }
    class Bestelling {
        -String bestellingId
        -Date bestellingDatum
        -BestellingStatus status
        +berekenTotaal() Geld
        +verzend() void
    }
    class Bestelregel {
        -int aantal
        -Geld stukprijs
        +getSubtotaal() Geld
    }
    class Product {
        -String sku
        -String naam
        -Geld prijs
        -int voorraad
    }
    Klant "1" --> "*" Bestelling : plaatst
    Bestelling "1" --> "*" Bestelregel : bevat
    Bestelregel "*" --> "1" Product : verwijst naar
```

---

:::info Over Mermaid via Kroki
Deze diagrammen worden server-side gerenderd door Kroki. De remark-kroki-a11y plugin parset de Mermaid syntax en genereert Nederlandstalige natuurlijke taal beschrijvingen.

Voor client-side Mermaid rendering (met `@docusaurus/theme-mermaid`), zie [Mermaid: Kroki vs Theme](./mermaid-theme-comparison).
:::
