# language: nl
Functionaliteit: Klassediagram met relaties
  Als screenreader gebruiker
  Wil ik overerving en andere relaties tussen klassen kunnen horen
  Zodat ik de klassenstructuur begrijp

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

  Scenario: PlantUML klassediagram met multipliciteiten
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
    En zou de beschrijving moeten bevatten "Car heeft een associatie naar Wheel, multipliciteit 1 naar 4"
    En zou de beschrijving moeten bevatten "Car heeft een associatie naar Engine, multipliciteit 1 naar 1"
