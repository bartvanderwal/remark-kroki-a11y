# language: en
Feature: Hide source while keeping A11y output
  As a content author
  I want to hide source tabs for specific diagrams
  So that students cannot directly copy the solution while accessibility stays available

  Scenario: hideSource hides source tab but keeps a11y tab and speak button
    Given a PlantUML kroki code block with hideSource:
      """
      @startuml
      class WordList {
        -words : String[]
        +sort() : void
      }
      @enduml
      """
    When I transform the code block with remark-kroki-a11y and speak button enabled
    Then the rendered controls should not contain source tab UI
    And the rendered controls should contain a11y description UI
    And the rendered controls should contain a speak button
