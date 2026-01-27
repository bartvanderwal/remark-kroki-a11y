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
