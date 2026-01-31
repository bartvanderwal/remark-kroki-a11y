# language: nl
Functionaliteit: Niet-ondersteunde diagramtypes
  Als screenreader gebruiker
  Wil ik een duidelijke melding krijgen wanneer een diagramtype nog niet ondersteund wordt
  Zodat ik weet dat ik de visuele versie moet bekijken of hulp moet vragen

  Scenario: C4 Context diagram nog niet ondersteund
    Gegeven het volgende PlantUML diagram met type "c4context":
      """
      @startuml
      !include <C4/C4_Context>
      Person(user, "Gebruiker", "Een persoon die de applicatie gebruikt")
      System(app, "Applicatie", "De hoofd applicatie")
      Rel(user, app, "Gebruikt")
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "ondersteunt nog geen C4 diagrammen"
    En zou de beschrijving moeten bevatten "Draag bij aan dit A11Y project"

  Scenario: C4 Container diagram nog niet ondersteund
    Gegeven het volgende PlantUML diagram met type "c4container":
      """
      @startuml
      !include <C4/C4_Container>
      Container(api, "API", "Node.js", "REST API")
      Container(db, "Database", "PostgreSQL", "Opslag")
      Rel(api, db, "Leest/schrijft")
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "ondersteunt nog geen C4 diagrammen"

  Scenario: C4 Component diagram nog niet ondersteund
    Gegeven het volgende PlantUML diagram met type "c4component":
      """
      @startuml
      !include <C4/C4_Component>
      Component(parser, "Parser", "JavaScript", "Parses diagram code")
      Component(generator, "Generator", "JavaScript", "Generates description")
      Rel(parser, generator, "Provides data to")
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "ondersteunt nog geen C4 diagrammen"

  Scenario: Sequentiediagram nog niet ondersteund
    Gegeven het volgende PlantUML diagram met type "sequence":
      """
      @startuml
      autonumber
      actor Alice
      participant Bob
      Alice -> Bob: bestelDrankje("appelsap")
      Bob --> Alice: betaal(2.00)
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "ondersteunt nog geen sequence diagrammen"
    En zou de beschrijving moeten bevatten "Draag bij aan dit A11Y project"
