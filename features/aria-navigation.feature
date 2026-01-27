# language: nl
Functionaliteit: ARIA navigatiestructuur
  Als screenreader gebruiker
  Wil ik door verschillende secties van het diagram kunnen navigeren
  Zodat ik efficiënt informatie kan vinden

  Scenario: ARIA secties worden gegenereerd
    Gegeven het volgende klassediagram:
      """
      classDiagram
          class A {
              +method() void
          }
          class B {
          }
          B --|> A
      """
    Als ik ARIA navigatiestructuur genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 2 klasses en 1 relatie.
      """
    En zou de ARIA overview moeten zijn "2 klasses, 1 relatie"
    En zou de structuur sectie "overview" moeten bevatten met label "Ga naar overzicht"
    En zou de structuur sectie "classes" moeten bevatten met label "Ga naar klassen"
    En zou de structuur sectie "relationships" moeten bevatten met label "Ga naar relaties"
    En zou de structuur sectie "notes" moeten bevatten met label "Ga naar notities"
