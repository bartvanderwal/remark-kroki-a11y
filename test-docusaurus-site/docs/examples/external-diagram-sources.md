---
sidebar_label: External `.puml` via `src`
---

# External PlantUML sources via `src`

This page demonstrates component-level `src` support on `kroki` code blocks.

Instead of putting the full PlantUML diagram inline, you can reference an include file name.  
The plugin wraps this as:

```plantuml
@startuml
!include your-file.puml
@enduml
```

These examples use files from `test-docusaurus-site/kroki-includes` (mounted by `docker-compose.kroki.yml`).

~~~md
```kroki imgType="plantuml" imgTitle="Order model" src="external-plantuml-src.puml"
```
~~~

## Class diagram from external `.puml`

```kroki imgType="plantuml" imgTitle="Order aggregate class diagram" src="external-plantuml-src.puml" lang="en"
```

## C4 Context diagram from external `.puml`

```kroki imgType="plantuml" imgTitle="Online bookstore C4 context" src="external-c4-context-src.puml" lang="en"
```
