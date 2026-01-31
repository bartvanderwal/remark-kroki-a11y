# language: nl
Functionaliteit: Basis klassediagram parsing
  Als screenreader gebruiker
  Wil ik een toegankelijke tekstuele beschrijving van eenvoudige klassediagrammen
  Zodat ik de diagramstructuur kan begrijpen

  Scenario: Eenvoudig klassediagram met één klasse
    Gegeven het volgende klassediagram:
      """
      classDiagram
          class Woordenlijst {
              -woorden : String[]
              +sorteer() void
          }
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 1 klasse en geen relaties.
      """
    En zou de beschrijving moeten bevatten "Klasse Woordenlijst"
    En zou de beschrijving moeten bevatten "private attribuut woorden van type String[]"
    En zou de beschrijving moeten bevatten "publieke methode sorteer, zonder parameters, return type void"

  Scenario: Klasse zonder attributen en methoden
    Gegeven het volgende klassediagram:
      """
      classDiagram
          class EmptyClass {
          }
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Klasse EmptyClass"

  Scenario: PlantUML klasse zonder methoden en attributen expliciet vermeld
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class EmptyClass
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Klasse EmptyClass"
    En zou de beschrijving moeten bevatten "zonder methoden en attributen"

  Scenario: PlantUML klasse met alleen methoden vermeldt geen attributen
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class Service {
        + doSomething()
      }
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Klasse Service"
    En zou de beschrijving moeten bevatten "publieke methode doSomething"
    En zou de beschrijving moeten bevatten "geen attributen"

  Scenario: PlantUML klasse met alleen attributen vermeldt geen methoden
    Gegeven het volgende PlantUML klassediagram:
      """
      @startuml
      class DataClass {
        - name : String
      }
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Klasse DataClass"
    Dan zou de beschrijving moeten bevatten "private attribuut name"
    En zou de beschrijving moeten bevatten "attribuut name van type String"
    En zou de beschrijving moeten bevatten "geen methoden"

  Scenario: PlantUML klasse met stereotype
    Gegeven het volgende PlantUML klassediagram:
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
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Klasse Car met stereotype Aggregate Root"
    En zou de beschrijving moeten bevatten "Klasse Wheel met stereotype Entity"
    En zou de beschrijving moeten bevatten "Klasse Color met stereotype Value Object"
