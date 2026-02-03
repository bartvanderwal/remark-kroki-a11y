# language: nl
Functionaliteit: Klassen met alleen attributen of methoden
  Als screenreader gebruiker
  Wil ik duidelijk horen of een klasse attributen, methoden of beide heeft
  Zodat ik de structuur van de klasse begrijp

  Scenario: Klasse met alleen attributen
    Gegeven het volgende klassediagram:
      """
      classDiagram
          class Person {
              +name : String
              +age : int
              #email : String
          }
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 1 klasse en geen relaties.
      """
    En zou de beschrijving moeten bevatten "publiek attribuut 'name' van type String"
    En zou de beschrijving moeten bevatten "publiek attribuut 'age' van type int"
    En zou de beschrijving moeten bevatten "protected attribuut 'email' van type String"

  Scenario: Klasse met alleen methoden
    Gegeven het volgende klassediagram:
      """
      classDiagram
          class Calculator {
              +add(a : int, b : int) int
              +subtract(a : int, b : int) int
              -validate(value : int) boolean
          }
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 1 klasse en geen relaties.
      """
    En zou de beschrijving moeten bevatten "publieke methode 'add', parameter 'a' van type int"
    En zou de beschrijving moeten bevatten "private methode 'validate'"

  # Larman-stijl: Analysefase domeinmodel zonder types

  Scenario: PlantUML klasse met attributen zonder types (Larman-stijl)
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Bestelling {
        besteldatum
        totaalbedrag
      }
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Klasse Bestelling"
    En zou de beschrijving moeten bevatten "attribuut 'besteldatum'"
    En zou de beschrijving moeten bevatten "attribuut 'totaalbedrag'"
    En zou de beschrijving niet moeten bevatten "unknown"

  Scenario: PlantUML klasse met methoden zonder parameters en return types (Larman-stijl)
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Bestelling {
        +plaatsen()
        +annuleren()
      }
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "publieke methode 'plaatsen'"
    Dan zou de beschrijving moeten bevatten "publieke methode 'annuleren'"
    En zou de beschrijving moeten bevatten "zonder parameters"

  # Fowler-stijl: Ontwerpfase domeinmodel met types

  Scenario: PlantUML klasse met attributen met types (Fowler-stijl)
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Bestelling {
        -besteldatum: LocalDate
        -totaalbedrag: BigDecimal
      }
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Klasse Bestelling"
    Dan zou de beschrijving moeten bevatten "private attribuut 'besteldatum' van type LocalDate"
    Dan zou de beschrijving moeten bevatten "private attribuut 'totaalbedrag' van type BigDecimal"

  Scenario: PlantUML methode met parameters met types (Fowler-stijl)
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Calculator {
        +add(a: int, b: int): int
        -validate(value: int): boolean
      }
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "publieke methode 'add', met parameter(s) 'a' van type int, 'b' van type int, return type int"
    Dan zou de beschrijving moeten bevatten "'a' van type int"
    Dan zou de beschrijving moeten bevatten "return type int"
    Dan zou de beschrijving moeten bevatten "private methode 'validate'"
