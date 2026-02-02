# language: nl
Functionaliteit: Klassediagram met relaties
  Als screenreader gebruiker
  Wil ik overerving en andere relaties tussen klassen kunnen horen
  Zodat ik de klassenstructuur begrijp

  Scenario: PlantUML klassediagram met aggregatie-relatie
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Tractor {
        + ploegen()
      }
      class Wiel {
      }
      Tractor o-- Wiel
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Tractor heeft een aggregatie-relatie met Wiel"

  Scenario: PlantUML klassediagram met dependency-relatie (domein)
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Teeltplan {
        + bepaalZaaiMoment()
      }
      class Weersverwachting {
      }
      Teeltplan ..> Weersverwachting
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Teeltplan heeft een afhankelijkheid naar Weersverwachting"

  Scenario: PlantUML klassediagram met compositie-relatie
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Huis {
        + openDeur()
      }
      class Kamer {
      }
      Huis *-- Kamer
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Huis heeft een compositie-relatie met Kamer"

  Scenario: Klassediagram met overerving
    Gegeven het volgende klassediagram:
      """
      classDiagram
          class Animal {
              +name : String
              +eat() void
          }
          class Dog {
              +bark() void
          }
          class Cat {
              +meow() void
          }
          Dog --|> Animal
          Cat --|> Animal
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 3 klasses en 2 relaties.
      """
    En zou de ARIA overview moeten zijn "3 klasses, 2 relaties"
    En zou de beschrijving moeten bevatten "Dog erft over van Animal"
    En zou de beschrijving moeten bevatten "Cat erft over van Animal"

  Scenario: PlantUML associatie-relatie zonder naam
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Order {
      }
      class Customer {
      }
      Order --> Customer
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Order heeft een associatie-relatie met Customer"

  Scenario: PlantUML associatie-relatie met naam
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Order {
      }
      class Customer {
      }
      Order --> Customer : geplaatstDoor
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Order heeft een associatie-relatie met naam 'geplaatstDoor' met Customer"

  Scenario: PlantUML associatie-relatie met multipliciteiten zonder naam
    Gegeven het volgende PlantUML klassediagram:
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
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 3 klasse(n) en 2 relatie(s).
      """
    En zou de beschrijving moeten bevatten "Car heeft een associatie-relatie met Wheel, multipliciteit 1 naar 4"
    En zou de beschrijving moeten bevatten "Car heeft een associatie-relatie met Engine, multipliciteit 1 naar 1"

  Scenario: PlantUML associatie-relatie met naam en multipliciteit
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class KlokDisplay {
      }
      class NummerDisplay {
      }
      KlokDisplay "1" --> "1" NummerDisplay : minuten
      KlokDisplay "1" --> "1" NummerDisplay : uren
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "KlokDisplay heeft een associatie-relatie met naam 'minuten' met NummerDisplay"
    En zou de beschrijving moeten bevatten "KlokDisplay heeft een associatie-relatie met naam 'uren' met NummerDisplay"

  Scenario: PlantUML associatie-relatie met naam in multipliciteit quote
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      left to right direction
      skinparam classAttributeIconSize 0
      hide circle

      class Werknemer

      class Project

      Project "0..*" ---> "medewerkers\n0..*" Werknemer
      Project "0..*" ----> "projectleider\n0..1" Werknemer

      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 2 klasse(n) en 2 relatie(s).
      """
    En zou de beschrijving moeten bevatten "Project heeft een associatie-relatie met naam 'medewerkers' met Werknemer, multipliciteit 0..* naar 0..*"
    En zou de beschrijving moeten bevatten "Project heeft een associatie-relatie met naam 'projectleider' met Werknemer, multipliciteit 0..* naar 0..1"

  Scenario: PlantUML klassediagram met dependency-relatie in omgekeerde richting
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Teeltplan {
        + bepaalZaaiMoment()
      }
      class Weersverwachting {
      }
      Weersverwachting <.. Teeltplan
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Teeltplan heeft een afhankelijkheid vanaf Weersverwachting"
