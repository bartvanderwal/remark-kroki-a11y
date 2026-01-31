# language: nl
Functionaliteit: Custom beschrijving override
  Als documentatie-auteur
  Wil ik een custom beschrijving kunnen opgeven voor een diagram
  Zodat ik zelf de toegankelijkheidstekst kan bepalen wanneer automatische generatie niet geschikt is

  Scenario: Custom beschrijving overschrijft automatische generatie voor klassendiagram
    Gegeven het volgende PlantUML klassediagram met customDescription:
      """
      @startuml
      class Voorbeeld {
        +methode()
      }
      @enduml
      """
    En de customDescription is "Geen automatische A11Y tekst: zie toelichting in tekst voor beschrijving wat er in dit diagram staat"
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Geen automatische A11Y tekst"
    En zou de beschrijving niet moeten bevatten "Klassendiagram"

  Scenario: Custom beschrijving voor sequentiediagram (café voorbeeld)
    Gegeven het volgende PlantUML klassediagram met customDescription:
      """
      @startuml
      autonumber
      actor Alice
      participant Bob
      Alice -> Bob: bestelDrankje("appelsap")
      Bob --> Alice: betaal(2.00)
      Alice --> Bob: betaald(2.00, walletId="ere-34-23")
      Bob --> Alice: geefDrankje("appelsap")
      @enduml
      """
    En de customDescription is "Zie toelichting onder dit diagram voor beschrijving van de interactie."
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Zie toelichting onder dit diagram"
    En zou de beschrijving niet moeten bevatten "ondersteunt nog geen"
