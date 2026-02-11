# language: en
Feature: C4 component diagram descriptions
  As a screen reader user
  I want accessible textual descriptions of C4 component diagrams
  So that I can understand the internal structure of a container without seeing the visual

  Scenario: Component diagram with container boundary
    Given the following PlantUML C4 component diagram:
      """
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

      Rel(index, classParser, "delegates class diagrams to")
      Rel(index, stateParser, "delegates state diagrams to")
      Rel(index, seqParser, "delegates sequence diagrams to")
      Rel(index, tabsGen, "uses for UI generation")

      SHOW_LEGEND()
      @enduml
      """
    When I generate a description in English
    Then the description should contain "C4 Component diagram for remark-kroki-a11y Plugin with:"
    And the description should contain "5 components: index.js, classDiagramParser.js, stateDiagramParser.js, sequenceDiagramParser.js, diagramTabs.js"
    And the description should contain "4 relationships:"
    And the description should contain "<li>index.js delegates class diagrams to classDiagramParser.js</li>"
    And the description should contain "<li>index.js delegates state diagrams to stateDiagramParser.js</li>"
    And the description should contain "<li>index.js delegates sequence diagrams to sequenceDiagramParser.js</li>"
    And the description should contain "<li>index.js uses for UI generation diagramTabs.js</li>"

  Scenario: Simple component diagram without container boundary
    Given the following PlantUML C4 component diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

      Component(api, "API Controller", "Java", "Handles REST requests")
      Component(service, "Business Service", "Java", "Core business logic")

      Rel(api, service, "calls")

      @enduml
      """
    When I generate a description in English
    Then the description should contain "C4 Component diagram with:"
    And the description should contain "2 components: API Controller, Business Service"
    And the description should contain "1 relationship:"
    And the description should contain "<li>API Controller calls Business Service</li>"

  Scenario: Single component diagram
    Given the following PlantUML C4 component diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

      Container_Boundary(app, "Application") {
          Component(main, "Main Module", "Python", "Entry point")
      }

      @enduml
      """
    When I generate a description in English
    Then the description should contain "C4 Component diagram for Application with:"
    And the description should contain "1 component: Main Module"
