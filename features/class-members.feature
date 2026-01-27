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
    En zou de beschrijving moeten bevatten "publiek attribuut name van type String"
    En zou de beschrijving moeten bevatten "publiek attribuut age van type int"
    En zou de beschrijving moeten bevatten "protected attribuut email van type String"

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
    En zou de beschrijving moeten bevatten "publieke methode add"
    En zou de beschrijving moeten bevatten "parameter a van type int"
    En zou de beschrijving moeten bevatten "private methode validate"
