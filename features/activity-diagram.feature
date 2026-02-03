# language: nl
Functionaliteit: Activiteitendiagram parsing
  Als screenreader gebruiker
  Wil ik een toegankelijke tekstuele beschrijving van activiteitendiagrammen
  Zodat ik de stroom en beslissingen in een proces kan begrijpen

  Scenario: Eenvoudig activiteitendiagram met beslispunt
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml

      start

      if (Graphviz installed?) then (yes)
        :process all\ndiagrams;
      else (no)
        :process only
        __sequence__ and __activity__ diagrams;
      endif

      stop

      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Activiteitendiagram met 2 activiteiten en 1 beslispunt.
      """
    En zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Stap 1. Beslissing: Graphviz installed?"
    En zou de beschrijving moeten bevatten "Ja: process all diagrams"
    En zou de beschrijving moeten bevatten "Nee: process only sequence and activity diagrams"
    En zou de beschrijving moeten bevatten "Stop"
    En zou de beschrijving niet moeten bevatten "Stap 1. Start"
    En zou de beschrijving niet moeten bevatten "Stap 2. Stop"

  Scenario: Activiteitendiagram met partities (Roodkapje overzicht)
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml
      !theme plain
      title Roodkapje - Overzicht

      start
      :Moeder geeft opdracht;
      note right: Breng mandje naar oma

      partition "A: Reis naar oma" {
        :Roodkapje vertrekt;
        :Ontmoeting met wolf;
        :Wolf rent vooruit;
      }

      partition "B: Bij oma thuis" {
        :Wolf eet oma;
        :Wolf vermomt zich;
        :Roodkapje arriveert;
        :Wolf eet Roodkapje;
      }

      partition "C: De redding" {
        :Jager arriveert;
        :Jager redt oma en Roodkapje;
        :Wolf wordt gestraft;
      }

      stop
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de eerste regel moeten zijn:
      """
      Activiteitendiagram met 3 partities en 11 activiteiten.
      """
    En zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Stap 1. Moeder geeft opdracht"
    En zou de beschrijving moeten bevatten "Partitie A: Reis naar oma"
    En zou de beschrijving moeten bevatten "Stap A1. Roodkapje vertrekt"
    En zou de beschrijving moeten bevatten "Stap A2. Ontmoeting met wolf"
    En zou de beschrijving moeten bevatten "Stap A3. Wolf rent vooruit"
    En zou de beschrijving moeten bevatten "Partitie B: Bij oma thuis"
    En zou de beschrijving moeten bevatten "Stap B1. Wolf eet oma"
    En zou de beschrijving moeten bevatten "Stap B2. Wolf vermomt zich"
    En zou de beschrijving moeten bevatten "Stap B3. Roodkapje arriveert"
    En zou de beschrijving moeten bevatten "Stap B4. Wolf eet Roodkapje"
    En zou de beschrijving moeten bevatten "Partitie C: De redding"
    En zou de beschrijving moeten bevatten "Stap C1. Jager arriveert"
    En zou de beschrijving moeten bevatten "Stap C2. Jager redt oma en Roodkapje"
    En zou de beschrijving moeten bevatten "Stap C3. Wolf wordt gestraft"
    En zou de beschrijving moeten bevatten "Stop"

  Scenario: Activiteitendiagram met while loop
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml
      start
      while (data available?) is (yes)
        :read data;
        :process data;
      endwhile (no)
      stop
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Stap 1. Herhaal zolang data available? (yes):"
    En zou de beschrijving moeten bevatten "Stap 1.1. read data"
    En zou de beschrijving moeten bevatten "Stap 1.2. process data"
    En zou de beschrijving moeten bevatten "Stop"

  Scenario: Activiteitendiagram met fork/join (parallelle activiteiten)
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml
      start
      :Voorbereiden;
      fork
        :Taak A;
      fork again
        :Taak B;
      end fork
      :Afronden;
      stop
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Stap 1. Voorbereiden"
    En zou de beschrijving moeten bevatten "Stap 2. Parallelle uitvoering:"
    En zou de beschrijving moeten bevatten "Stap 2.1. Taak A"
    En zou de beschrijving moeten bevatten "Stap 2.2. Taak B"
    En zou de beschrijving moeten bevatten "Stap 3. Afronden"
    En zou de beschrijving moeten bevatten "Stop"
