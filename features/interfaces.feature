# language: nl
Functionaliteit: Strategy Pattern met interfaces
  Als screenreader gebruiker
  Wil ik interfaces en hun implementaties kunnen herkennen
  Zodat ik design patterns in code kan begrijpen

  Scenario: Interface implementatie
    Gegeven het volgende klassediagram:
      """
      classDiagram
          class Woordenlijst {
              -woorden : String[]
              +sorteer() void
              +setSorteerStrategie(strategie : SorteerStrategie) void
          }
          class SorteerStrategie {
              <<interface>>
              +sorteer(woorden : String[]) void
          }
          class MergeSort {
              +sorteer(woorden : String[]) void
          }
          class QuickSort {
              +sorteer(woorden : String[]) void
          }
          Woordenlijst --> "1" SorteerStrategie : -huidigeStrategie
          MergeSort ..|> SorteerStrategie
          QuickSort ..|> SorteerStrategie
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Klassendiagram met 4 klasses en 3 relaties.
      """
    En zou de ARIA overview moeten zijn "4 klasses, 3 relaties"
    En zou de beschrijving moeten bevatten "Interface SorteerStrategie"
    En zou de beschrijving moeten bevatten "MergeSort implementeert interface SorteerStrategie"
    En zou de beschrijving moeten bevatten "QuickSort implementeert interface SorteerStrategie"
