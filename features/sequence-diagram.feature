# language: nl
Functionaliteit: Sequentiediagram parsing
  Als screenreader gebruiker
  Wil ik een toegankelijke tekstuele beschrijving van sequentiediagrammen
  Zodat ik de interacties tussen deelnemers kan begrijpen

  Scenario: Roodkapje bezoekt Oma - methode aanroepen
    Gegeven het volgende Mermaid sequentiediagram:
      """
      sequenceDiagram
          participant Roodkapje
          participant Wolf
          participant Oma
          Roodkapje->>Wolf: groet()
          Wolf->>Roodkapje: vraagBestemming()
          Roodkapje-->>Wolf: "Naar Oma"
          Wolf->>Oma: eetOp()
          Roodkapje->>Oma: klop()
          Wolf-->>Roodkapje: "Kom binnen"
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Sequentiediagram met 3 deelnemers: Roodkapje, Wolf en Oma.
      """
    En zou de beschrijving moeten bevatten "Roodkapje roept Wolf.groet() aan"
    En zou de beschrijving moeten bevatten "Wolf roept Roodkapje.vraagBestemming() aan"
    En zou de beschrijving moeten bevatten "Roodkapje antwoordt Wolf: 'Naar Oma'"
    En zou de beschrijving moeten bevatten "Wolf roept Oma.eetOp() aan"
    En zou de beschrijving moeten bevatten "Roodkapje roept Oma.klop() aan"
    En zou de beschrijving moeten bevatten "Wolf antwoordt Roodkapje: 'Kom binnen'"

  Scenario: Getypeerde instanties met methode parameters
    Gegeven het volgende Mermaid sequentiediagram:
      """
      sequenceDiagram
          participant alice as alice: Person
          participant bob as bob: Person
          participant server as server: GreetingService
          alice->>server: createGreeting(name: String, formal: boolean)
          server-->>alice: Groet
          alice->>bob: zegGroet(bericht: Groet)
          bob-->>alice: void
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Sequentiediagram met 3 deelnemers: alice van het type Person, bob van het type Person en server van het type GreetingService.
      """
    En zou de beschrijving moeten bevatten "alice roept server.createGreeting(name: String, formal: boolean) aan"
    En zou de beschrijving moeten bevatten "server antwoordt alice: Groet"
    En zou de beschrijving moeten bevatten "alice roept bob.zegGroet(bericht: Groet) aan"
    En zou de beschrijving moeten bevatten "bob antwoordt alice: void"

  Scenario: PlantUML KlokDisplay met autonumber en geneste types
    Gegeven het volgende PlantUML sequentiediagram:
      """
      @startuml

      autonumber

      participant "klok:\nKlokDisplay" as klok
      participant "minuten:\nNummerDisplay" as minuten
      participant "uren:\nNummerDisplay" as uren

      [-> klok: tikTijd()
      klok -> minuten: increment()
      klok -> minuten: waarde = getWaarde()

      opt waarde == 0
          klok -> uren: increment()
      end

      klok -> klok: updateDisplay()
      klok -> minuten: getDisplayWaarde()
      klok -> uren: getDisplayWaarde()
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Sequentiediagram met 3 deelnemers: klok van het type KlokDisplay, minuten van het type NummerDisplay en uren van het type NummerDisplay.
      """
    En zou de beschrijving moeten bevatten "klok ontvangt tikTijd()"
    En zou de beschrijving moeten bevatten "klok roept minuten.increment() aan"
    En zou de beschrijving moeten bevatten "klok roept minuten.waarde = getWaarde() aan"
    En zou de beschrijving moeten bevatten "klok roept uren.increment() aan"
    En zou de beschrijving moeten bevatten "klok roept klok.updateDisplay() aan"
    En zou de beschrijving moeten bevatten "klok roept minuten.getDisplayWaarde() aan"
    En zou de beschrijving moeten bevatten "klok roept uren.getDisplayWaarde() aan"
    En zou de beschrijving moeten bevatten "<ol>"
