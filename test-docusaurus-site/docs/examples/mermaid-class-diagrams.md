---
id: mermaid-class-diagrams
title: Mermaid Class Diagrams
sidebar_label: Mermaid Class Diagrams
description: Test Mermaid class diagrams with automatic A11y descriptions via Kroki
---

# Mermaid Class Diagrams

This page tests Mermaid class diagrams rendered via Kroki, with automatically generated natural language descriptions.

## Strategy Pattern (Mermaid via Kroki)

The same Strategy Pattern example as PlantUML, but written in Mermaid syntax:

```kroki imgType="mermaid" imgTitle="Strategy Pattern (Mermaid)"
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

## Simple Animal Hierarchy

A simple inheritance example:

```kroki imgType="mermaid" imgTitle="Animal Hierarchy"
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +String breed
        +bark() void
    }
    class Cat {
        +String color
        +meow() void
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

## E-commerce Domain Model

A more complex domain model:

```kroki imgType="mermaid" imgTitle="E-commerce Domain"
classDiagram
    class Customer {
        -String id
        -String name
        -String email
        +placeOrder(items) Order
    }
    class Order {
        -String orderId
        -Date orderDate
        -OrderStatus status
        +calculateTotal() Money
        +ship() void
    }
    class OrderLine {
        -int quantity
        -Money unitPrice
        +getSubtotal() Money
    }
    class Product {
        -String sku
        -String name
        -Money price
        -int stockQuantity
    }
    Customer "1" --> "*" Order : places
    Order "1" --> "*" OrderLine : contains
    OrderLine "*" --> "1" Product : refers to
```

---

:::info About Mermaid via Kroki
These diagrams are rendered server-side by Kroki. The remark-kroki-a11y plugin parses the Mermaid syntax and generates natural language descriptions.

For client-side Mermaid rendering (using `@docusaurus/theme-mermaid`), see [Mermaid Theme Comparison](./mermaid-theme-comparison).
:::