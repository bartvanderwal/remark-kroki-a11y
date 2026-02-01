# remark-kroki-a11y Plugin Architectuur

:::info Work in Progress
Dit document beschrijft een **conceptuele** architectuurbenadering. De huidige implementatie ondersteunt nog geen volledige adapter pattern, en de diagramcompatibiliteit tussen PlantUML en Mermaid vereist nog nader onderzoek.
:::

## C4 Model Aanpak

We volgen de C4-model hiërarchie:

1. **System Context** - De plugin in zijn omgeving
2. **Container** - Aangezien de plugin één deployable unit is, valt dit samen met context
3. **Component** - Interne structuur van de plugin (parsers, generators)
4. **Code** - Details van individuele componenten (class diagrams, sequence diagrams)

## 1. System Context Diagram

De plugin functioneert binnen een ecosysteem van static site generators en diagram rendering services.

```kroki imgType="plantuml" imgTitle="System Context: remark-kroki-a11y" lang="en" customDescription="C4 System Context diagram showing the remark-kroki-a11y plugin in its ecosystem. The plugin integrates with static site generators like Docusaurus, mdBook, or Jekyll. It receives diagram source code from content authors and generates accessible HTML with natural language descriptions. The Kroki service renders the actual diagram images."
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

title System Context: remark-kroki-a11y Plugin

Person(author, "Content Author", "Writes documentation with PlantUML/Mermaid diagrams")
Person(reader, "Reader", "Consumes documentation, possibly using assistive technology")

System(plugin, "remark-kroki-a11y", "Remark plugin that adds accessible descriptions to diagrams")

System_Ext(ssg, "Static Site Generator", "Docusaurus, mdBook, Jekyll, etc.")
System_Ext(kroki, "Kroki Service", "Renders diagrams to SVG/PNG")
System_Ext(browser, "Web Browser", "Renders final HTML with diagrams and descriptions")

Rel(author, ssg, "Writes Markdown with diagrams")
Rel(ssg, plugin, "Processes Markdown via remark pipeline")
Rel(plugin, kroki, "Requests diagram images")
Rel(ssg, browser, "Generates HTML site")
Rel(reader, browser, "Views documentation")

SHOW_LEGEND()
@enduml
```

### Context Toelichting

- **Content Authors** schrijven Markdown met embedded PlantUML of Mermaid code blocks
- **Static Site Generators** (SSGs) zoals Docusaurus gebruiken de plugin in hun remark pipeline
- De plugin voegt **toegankelijke beschrijvingen** toe vóórdat Kroki de diagrammen rendert
- **Kroki** converteert de diagramcode naar afbeeldingen (SVG/PNG)
- **Readers** (inclusief screenreader-gebruikers) kunnen de diagrammen begrijpen via de beschrijvingen

## 2. Component Diagram (Huidige Implementatie)

Dit toont de werkelijke structuur van de huidige codebase.

```kroki imgType="plantuml" imgTitle="Component Diagram: Current Implementation" lang="en" customDescription="C4 Component diagram showing the current plugin structure. The main index.js orchestrates diagram processing. Separate parsers exist for class diagrams, state diagrams, and sequence diagrams. Each parser generates localized descriptions in Dutch and English."
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

title Component Diagram: remark-kroki-a11y (Current)

Container_Boundary(plugin, "remark-kroki-a11y Plugin") {
    Component(index, "index.js", "JavaScript", "Main entry point, remark plugin interface")
    Component(classParser, "classDiagramParser.js", "JavaScript", "Parses PlantUML/Mermaid class diagrams")
    Component(stateParser, "stateDiagramParser.js", "JavaScript", "Parses PlantUML state diagrams")
    Component(seqParser, "sequenceDiagramParser.js", "JavaScript", "Parses PlantUML/Mermaid sequence diagrams")
    Component(tabsGen, "diagramTabs.js", "JavaScript", "Generates expandable tabs UI")
}

Rel(index, classParser, "delegates class diagrams")
Rel(index, stateParser, "delegates state diagrams")
Rel(index, seqParser, "delegates sequence diagrams")
Rel(index, tabsGen, "uses for UI generation")

SHOW_LEGEND()
@enduml
```

## 3. Sequence Diagram: Build-time Processing

Dit toont de flow wanneer een static site generator de website bouwt.

```kroki imgType="plantuml" imgTitle="Sequence Diagram: Build-time Flow" lang="en" customDescription="Sequence diagram showing the build-time processing flow. When the static site generator builds a page, it processes each diagram code block. For each diagram, the plugin detects the type, parses the source code, generates a natural language description, and creates tabs for source code and description. Finally, remark-kroki-plugin requests the diagram image from Kroki."
@startuml
title Build-time Processing Flow

participant "Static Site\nGenerator" as SSG
participant "remark-kroki-a11y\n(this plugin)" as Plugin
participant "Parser\n(class/state/sequence)" as Parser
participant "remark-kroki-plugin" as KrokiPlugin
participant "Kroki Service" as Kroki

SSG -> SSG: Start build
SSG -> SSG: Load Markdown page

loop for each diagram code block
    SSG -> Plugin: Process code block

    Plugin -> Plugin: Detect diagram type\n(class/state/sequence)
    Plugin -> Parser: Parse diagram source
    Parser --> Plugin: Parsed structure\n(classes, relations, etc.)

    Plugin -> Plugin: Generate natural language\ndescription (NL or EN)
    Plugin -> Plugin: Create tabs HTML:\n- Source code tab\n- Description tab

    Plugin --> SSG: Modified AST with\ntabs and description

    SSG -> KrokiPlugin: Process same code block
    KrokiPlugin -> Kroki: Request SVG/PNG
    Kroki --> KrokiPlugin: Diagram image
    KrokiPlugin --> SSG: Image embedded in AST
end

SSG -> SSG: Generate HTML output
SSG -> SSG: Write to build folder

@enduml
```

### Flow Toelichting

1. **Build start** - SSG (bijv. Docusaurus) start de build
2. **Per diagram**:
   - remark-kroki-a11y detecteert het diagram type
   - De juiste parser analyseert de broncode
   - Een natuurlijke taal beschrijving wordt gegenereerd
   - Tabs worden toegevoegd (Source / Natural Language)
3. **remark-kroki-plugin** (apart) rendert de afbeelding via Kroki
4. **Output** - HTML met diagram + toegankelijke beschrijving

## 4. Code Level: Parser Details

Voor details over individuele parsers, zie de broncode:

- [`src/parsers/classDiagramParser.js`](https://github.com/bartvanderwal/remark-kroki-a11y/blob/main/src/parsers/classDiagramParser.js) - Klassen, attributen, methodes, relaties
- [`src/parsers/stateDiagramParser.js`](https://github.com/bartvanderwal/remark-kroki-a11y/blob/main/src/parsers/stateDiagramParser.js) - States en transities
- [`src/parsers/sequenceDiagramParser.js`](https://github.com/bartvanderwal/remark-kroki-a11y/blob/main/src/parsers/sequenceDiagramParser.js) - Participants en messages

## Huidige Status

De plugin ondersteunt momenteel:

| Diagram Type | PlantUML | Mermaid | Status |
|--------------|----------|---------|--------|
| Class diagrams | ✅ Full | ⚠️ To test | Partial |
| State diagrams | ✅ Full | ❌ | Partial |
| Sequence diagrams | ⚠️ Beta | ⚠️ Beta | Partial |

## Open Onderzoeksvragen

### Mermaid vs PlantUML Compatibiliteit

De vraag is nog open: **Wat is de overlap tussen Mermaid en PlantUML diagrams?**

- PlantUML ondersteunt meer diagram-types en syntax-variaties
- Mermaid heeft mogelijk ook unieke features die PlantUML niet heeft
- Een **Venn diagram** zou beter de overlap en verschillen kunnen tonen

**Gevolgen voor architectuur:**

- Als Mermaid een subset van PlantUML is → Adapter pattern kan werken
- Als er overlap maar ook unieke features zijn → Aparte parsers blijven nodig

## Bronnen & Referenties

- [PlantUML Documentatie](http://plantuml.com/)
- [Mermaid Documentatie](https://mermaid.js.org/)
- [C4 Model](https://c4model.com/)
- C4-PlantUML: [plantuml-stdlib/C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)
