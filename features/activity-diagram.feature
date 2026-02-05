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
    En zou de beschrijving moeten bevatten "Beslissing: Graphviz installed?"
    En zou de beschrijving moeten bevatten "Ja: Stap. process all diagrams"
    En zou de beschrijving moeten bevatten "Nee: Stap. process only sequence and activity diagrams"
    En zou de beschrijving moeten bevatten "Stop"

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
        :Wolf eet oma op;
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
    En zou de beschrijving moeten bevatten "Stap. Moeder geeft opdracht"
    En zou de beschrijving moeten bevatten "Partitie A: Reis naar oma, bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. Roodkapje vertrekt"
    En zou de beschrijving moeten bevatten "Stap. Ontmoeting met wolf"
    En zou de beschrijving moeten bevatten "Stap. Wolf rent vooruit"
    En zou de beschrijving moeten bevatten "Einde partitie A."
    En zou de beschrijving moeten bevatten "Partitie B: Bij oma thuis, bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. Wolf eet oma"
    En zou de beschrijving moeten bevatten "Stap. Wolf vermomt zich"
    En zou de beschrijving moeten bevatten "Stap. Roodkapje arriveert"
    En zou de beschrijving moeten bevatten "Stap. Wolf eet Roodkapje"
    En zou de beschrijving moeten bevatten "Einde partitie B."
    En zou de beschrijving moeten bevatten "Partitie C: De redding, bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. Jager arriveert"
    En zou de beschrijving moeten bevatten "Stap. Jager redt oma en Roodkapje"
    En zou de beschrijving moeten bevatten "Stap. Wolf wordt gestraft"
    En zou de beschrijving moeten bevatten "Einde partitie C."
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
    En zou de beschrijving moeten bevatten "Herhaal zolang data available? (yes), bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. read data"
    En zou de beschrijving moeten bevatten "Stap. process data"
    En zou de beschrijving moeten bevatten "Einde herhaling."
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
    En zou de beschrijving moeten bevatten "Stap. Voorbereiden"
    En zou de beschrijving moeten bevatten "Parallelle uitvoering 1, bestaande uit:"
    En zou de beschrijving moeten bevatten "Tak 1:"
    En zou de beschrijving moeten bevatten "Stap. Taak A"
    En zou de beschrijving moeten bevatten "Tak 2:"
    En zou de beschrijving moeten bevatten "Stap. Taak B"
    En zou de beschrijving moeten bevatten "Einde parallelle uitvoering 1."
    En zou de beschrijving moeten bevatten "Stap. Afronden"
    En zou de beschrijving moeten bevatten "Stop"

  Scenario: Activiteitendiagram met split/split again (parallelle activiteiten)
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml
      start
      :Voorbereiden;
      split
        :Taak A;
      split again
        :Taak B;
      end split
      :Afronden;
      stop
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Stap. Voorbereiden"
    En zou de beschrijving moeten bevatten "Parallelle uitvoering 1, bestaande uit:"
    En zou de beschrijving moeten bevatten "Tak 1:"
    En zou de beschrijving moeten bevatten "Stap. Taak A"
    En zou de beschrijving moeten bevatten "Tak 2:"
    En zou de beschrijving moeten bevatten "Stap. Taak B"
    En zou de beschrijving moeten bevatten "Einde parallelle uitvoering 1."
    En zou de beschrijving moeten bevatten "Stap. Afronden"
    En zou de beschrijving moeten bevatten "Stop"

  Scenario: Activiteitendiagram met repeat/repeat while (do-while loop)
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml
      start
      :initialiseer;
      repeat
        :verwerk item;
        :controleer resultaat;
      repeat while (meer items)
      :afronden;
      stop
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Stap. initialiseer"
    En zou de beschrijving moeten bevatten "Herhaal zolang meer items, bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. verwerk item"
    En zou de beschrijving moeten bevatten "Stap. controleer resultaat"
    En zou de beschrijving moeten bevatten "Einde herhaling."
    En zou de beschrijving moeten bevatten "Stap. afronden"
    En zou de beschrijving moeten bevatten "Stop"

  Scenario: Activiteitendiagram met partitie zonder letterlabel
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml
      start
      partition "Informatie verzamelen" {
        :bronnen zoeken;
        :documenten lezen;
      }
      partition "Uitwerken" {
        :ontwerp maken;
        :implementeren;
      }
      stop
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Partitie: Informatie verzamelen, bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. bronnen zoeken"
    En zou de beschrijving moeten bevatten "Stap. documenten lezen"
    En zou de beschrijving moeten bevatten "Einde partitie."
    En zou de beschrijving moeten bevatten "Partitie: Uitwerken, bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. ontwerp maken"
    En zou de beschrijving moeten bevatten "Stap. implementeren"
    En zou de beschrijving moeten bevatten "Stop"

  Scenario: Geneste parallelle uitvoering met meerdere items per tak
    Gegeven het volgende PlantUML diagram met type "activity":
      """
      @startuml
      start
      fork
        :Taak A1;
        :Taak A2;
      fork again
        :Taak B1;
        fork
          :Taak B2a;
        fork again
          :Taak B2b;
        end fork
        :Taak B3;
      end fork
      stop
      @enduml
      """
    Als ik een beschrijving genereer
    Dan zou de beschrijving moeten bevatten "Start"
    En zou de beschrijving moeten bevatten "Parallelle uitvoering 1, bestaande uit:"
    En zou de beschrijving moeten bevatten "Tak 1:"
    En zou de beschrijving moeten bevatten "Stap. Taak A1"
    En zou de beschrijving moeten bevatten "Stap. Taak A2"
    En zou de beschrijving moeten bevatten "Tak 2:"
    En zou de beschrijving moeten bevatten "Stap. Taak B1"
    En zou de beschrijving moeten bevatten "Parallelle uitvoering 2, bestaande uit:"
    En zou de beschrijving moeten bevatten "Stap. Taak B2a"
    En zou de beschrijving moeten bevatten "Stap. Taak B2b"
    En zou de beschrijving moeten bevatten "Einde parallelle uitvoering 2."
    En zou de beschrijving moeten bevatten "Stap. Taak B3"
    En zou de beschrijving moeten bevatten "Einde parallelle uitvoering 1."
    En zou de beschrijving moeten bevatten "Stop"
