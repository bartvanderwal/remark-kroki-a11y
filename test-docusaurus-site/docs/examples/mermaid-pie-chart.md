---
title: Mermaid Pie Chart
description: Example of a Mermaid pie chart with custom accessibility description
---

Pie charts are a great example of a non-technical diagram type that benefits from accessible descriptions. While PlantUML focuses primarily on UML diagrams, Mermaid supports various data visualization types including pie charts.

## Example: Programming Language Popularity

This pie chart shows a fictional distribution of programming language usage in a project:

```kroki imgType="mermaid" imgTitle="Programming Language Distribution" customDescription="Pie chart showing programming language distribution: JavaScript at 40%, Python at 30%, TypeScript at 20%, and Other languages at 10%."
pie showData
    title Programming Languages Used
    "JavaScript" : 40
    "Python" : 30
    "TypeScript" : 20
    "Other" : 10
```

## Example: Time Allocation

A pie chart showing how a developer might spend their time:

```kroki imgType="mermaid" imgTitle="Developer Time Allocation" customDescription="Pie chart showing developer time allocation: 35% writing code, 25% debugging, 20% in meetings, 15% reviewing code, and 5% on documentation."
pie showData
    title Developer Time Allocation
    "Writing Code" : 35
    "Debugging" : 25
    "Meetings" : 20
    "Code Review" : 15
    "Documentation" : 5
```

## Example: Without showData Directive

A pie chart without the `showData` keyword (Mermaid does NOT display values/percentages in this case):

```kroki imgType="mermaid" imgTitle="Browser Market Share"
pie
    title Browser Market Share
    "Chrome" : 65
    "Safari" : 20
    "Firefox" : 10
    "Edge" : 5
```

:::info showData Behavior
When `showData` is present, Mermaid displays both raw values and percentages in the visual. When omitted, only the pie slices are shown without labels. Our a11y descriptions match what sighted users see - including percentages when `showData` is used, and determining the appropriate format when it's not. See [ADR-0011](../adr/0011-faithful-source-representation.md) for the rationale.
:::

## A11y Support Status

Pie charts currently use `customDescription` for accessibility descriptions. Automatic parsing support is planned - see [GitHub Issue #16](https://github.com/bartvanderwal/remark-kroki-a11y/issues/16) for progress.

:::tip Why Pie Charts Matter for A11y
Pie charts are often used in reports and presentations to communicate proportions at a glance. For users who cannot see the visual, a proper description like "JavaScript at 40%, Python at 30%..." conveys the same information effectively.
:::
