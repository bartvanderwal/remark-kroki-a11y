Feature: Unsupported diagram types (English)
  As a screen reader user
  I want to receive a clear message when a diagram type is not yet supported
  So that I know I need to view the visual version or ask for help

  Scenario: C4 Component diagram not yet supported (English)
    Given the following PlantUML diagram with type "c4component":
      """
      @startuml
      !include <C4/C4_Component>
      Component(parser, "Parser", "JavaScript", "Parses diagram code")
      @enduml
      """
    When I generate a description in English
    Then the description should contain "does not yet support C4 diagrams"
    And the description should contain "Contribute to this A11Y project"
