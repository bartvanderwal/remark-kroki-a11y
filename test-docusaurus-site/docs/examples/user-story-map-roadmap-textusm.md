---
title: User Story Map Roadmap (TextUSM)
sidebar_label: User Story Map (Roadmap)
description: Roadmap map of current and planned remark-kroki-a11y capabilities, modeled in TextUSM.
---

# User Story Map Roadmap (TextUSM)

Deze user story map bevat:

- huidige `remark-kroki-a11y` features
- uitbreiding richting Domain Stories
- een online `kroki-a11y` editor/playground
- de VS Code-live-a11y user story

![remark-kroki-a11y roadmap user story map](./kroki-a11y-roadmap.usm.svg)

<details>
<summary>TextUSM bronbestand</summary>

```textusm
# labels: ACTIVITY, USER GOAL, USER STORY, NOW, NEXT, LATER, BACKLOG
# release1: NOW - huidige features en basiswaarde
# release2: NEXT - domain stories + online editor MVP
# release3: LATER - VS Code live a11y + bredere C4/UML dekking
# release4: BACKLOG
remark-kroki-a11y roadmap
	Diagrammen modelleren
		Als docent/developer wil ik UML en C4 diagrammen kunnen maken
			US-01 Als developer wil ik PlantUML en Mermaid diagrammen in docs kunnen opnemen, zodat ik diagram-as-code kan gebruiken
			US-02 Als developer wil ik source tabs en a11y-beschrijving onder diagrammen zien, zodat ik output kan controleren
			US-03 Als developer wil ik robuuste C4/UML parsing voor zelfgemaakte modellen, zodat ook component- en designniveau diagrams toegankelijk zijn
	Diagrammen toegankelijk begrijpen
		Als slechtziende, blinde of beginnende developer wil ik de diagraminhoud kunnen begrijpen
			US-04 Als lezer wil ik natural-language beschrijvingen bij ondersteunde diagramtypen krijgen, zodat ik het diagram zonder visuele inspectie begrijp
			US-05 Als lezer wil ik fallback-tekst en duidelijke status bij niet-ondersteunde diagramtypen, zodat ik weet wat ontbreekt
			US-06 Als slechtziende, blinde of beginnende developer wil ik direct in VS Code de a11y informatie van remark-kroki-a11y kunnen zien en beluisteren bij een diagram dat ik aan het maken ben, zodat ik tijdens het ontwikkelen al ondersteuning heb
	Snel valideren en experimenteren
		Als contributor wil ik snel kunnen testen of diagram + a11y klopt
			US-07 Als contributor wil ik een online kroki-a11y playground met render + source + natural language tabs, zodat ik snel iteraties kan doen
			US-08 Als contributor wil ik server keuze (kroki.io, localhost, custom) en health status, zodat ik lokaal en online betrouwbaar kan testen
			US-09 Als contributor wil ik live editing met shareable links in de online editor, zodat feedback en review sneller gaan
	Domeinverhaal naar backlog brengen
		Als team wil ik Domain Stories verbinden met ontwerp en planning
			US-10 Als team wil ik Domain Stories naast UML/C4 kunnen modelleren, zodat businessflow en ontwerp gekoppeld blijven
			US-11 Als team wil ik vanuit Domain Stories user stories en slices kunnen afleiden, zodat refinement en releaseplanning beter gaan
```

</details>
