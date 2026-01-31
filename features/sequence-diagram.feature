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
      Sequentiediagram met 3 deelnemers: alice (instantie van Person), bob (instantie van Person) en server (instantie van GreetingService).
      """
    En zou de beschrijving moeten bevatten "alice roept server.createGreeting(name: String, formal: boolean) aan"
    En zou de beschrijving moeten bevatten "server antwoordt alice: Groet"
    En zou de beschrijving moeten bevatten "alice roept bob.zegGroet(bericht: Groet) aan"
    En zou de beschrijving moeten bevatten "bob antwoordt alice: void"
