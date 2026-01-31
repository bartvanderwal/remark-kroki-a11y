# language: en
Feature: English class diagram descriptions
  As a screen reader user
  I want accessible textual descriptions of class diagrams in English
  So that I can understand the diagram structure

  Scenario: PlantUML class with stereotype (English)
    Given the following PlantUML class diagram:
      """
      @startuml
      class Car <<Aggregate Root>> {
        + drive()
      }
      class Wheel <<Entity>> {
      }
      class Color <<Value Object>>
      @enduml
      """
    When I generate a description in English
    Then the description should contain "Class Car with stereotype Aggregate Root"
    And the description should contain "Class Wheel with stereotype Entity"
    And the description should contain "Class Color with stereotype Value Object"

  Scenario: PlantUML class diagram with multiplicities (English)
    Given the following PlantUML class diagram:
      """
      @startuml
      class Car {
        + drive()
      }
      class Wheel {
      }
      class Engine {
      }
      Car "1" -- "4" Wheel
      Car "1" -- "1" Engine
      @enduml
      """
    When I generate a description in English
    Then the first line should be:
      """
      Class diagram with 3 class(es) and 2 relation(s).
      """
    And the description should contain "Car has an association-relationship with Wheel (is associated with), multiplicity 1 to 4"
    And the description should contain "Car has an association-relationship with Engine (is associated with), multiplicity 1 to 1"
