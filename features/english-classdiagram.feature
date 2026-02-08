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

  Scenario: PlantUML association without name (English)
    Given the following PlantUML class diagram:
      """
      @startuml
      class Order {
      }
      class Customer {
      }
      Order --> Customer
      @enduml
      """
    When I generate a description in English
    Then the description should contain "Order has an association-relationship with Customer"

  Scenario: PlantUML association with name (English)
    Given the following PlantUML class diagram:
      """
      @startuml
      class Order {
      }
      class Customer {
      }
      Order --> Customer : placedBy
      @enduml
      """
    When I generate a description in English
    Then the description should contain "Order has an association-relationship named 'placedBy' with Customer"

  Scenario: PlantUML association with multiplicities without name (English)
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
    And the description should contain "Car has an association-relationship with Wheel, multiplicity 1 to 4"
    And the description should contain "Car has an association-relationship with Engine, multiplicity 1 to 1"

  Scenario: PlantUML association with name and multiplicity (English)
    Given the following PlantUML class diagram:
      """
      @startuml
      class ClockDisplay {
      }
      class NumberDisplay {
      }
      ClockDisplay "1" --> "1" NumberDisplay : minutes
      ClockDisplay "1" --> "1" NumberDisplay : hours
      @enduml
      """
    When I generate a description in English
    Then the description should contain "ClockDisplay has an association-relationship named 'minutes' with NumberDisplay"
    And the description should contain "ClockDisplay has an association-relationship named 'hours' with NumberDisplay"

  # Generic types - List<String> is read as "List of String"

  Scenario: PlantUML class with generic type List<String> (English)
    Given the following PlantUML class diagram:
      """
      @startuml
      class WordList {
        -words: List<String>
      }
      @enduml
      """
    When I generate a description in English
    Then the description should contain "Class WordList"
    And the description should contain "private attribute 'words' of type List of String"

  Scenario: PlantUML class with generic type with multiple type parameters (English)
    Given the following PlantUML class diagram:
      """
      @startuml
      class Cache {
        -items: Map<String, Integer>
      }
      @enduml
      """
    When I generate a description in English
    Then the description should contain "private attribute 'items' of type Map of String, Integer"
