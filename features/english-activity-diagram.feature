Feature: English activity diagram descriptions
  As a screen reader user
  I want accessible textual descriptions of activity diagrams in English
  So that I can understand the flow and decisions in a process

  Scenario: Simple activity diagram with decision point (English)
    Given the following PlantUML activity diagram:
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
    When I generate a description in English
    Then the first line should be:
      """
      Activity diagram with 2 activities and 1 decision point.
      """
    And the description should contain "Start"
    And the description should contain "Decision: Graphviz installed?"
    And the description should contain "Yes: Step. process all diagrams"
    And the description should contain "No: Step. process only sequence and activity diagrams"
    And the description should contain "Stop"

  Scenario: Activity diagram with partitions (Little Red Riding Hood overview - English)
    Given the following PlantUML activity diagram:
      """
      @startuml
      !theme plain
      title Little Red Riding Hood - Overview

      start
      :Mother gives order;
      note right: Bring basket to grandmother

      partition "A: Journey to grandmother" {
        :Little Red Riding Hood departs;
        :Meeting with wolf;
        :Wolf runs ahead;
      }

      partition "B: At grandmother's house" {
        :Wolf eats grandmother;
        :Wolf disguises itself;
        :Little Red Riding Hood arrives;
        :Wolf eats Little Red Riding Hood;
      }

      partition "C: The rescue" {
        :Hunter arrives;
        :Hunter saves grandmother and Little Red Riding Hood;
        :Wolf is punished;
      }

      stop
      @enduml
      """
    When I generate a description in English
    Then the first line should be:
      """
      Activity diagram with 3 partitions and 11 activities.
      """
    And the description should contain "Start"
    And the description should contain "Step. Mother gives order"
    And the description should contain "Partition A: Journey to grandmother, consisting of:"
    And the description should contain "Step. Little Red Riding Hood departs"
    And the description should contain "Step. Meeting with wolf"
    And the description should contain "Step. Wolf runs ahead"
    And the description should contain "End partition A."
    And the description should contain "Partition B: At grandmother's house, consisting of:"
    And the description should contain "Step. Wolf eats grandmother"
    And the description should contain "Step. Wolf disguises itself"
    And the description should contain "Step. Little Red Riding Hood arrives"
    And the description should contain "Step. Wolf eats Little Red Riding Hood"
    And the description should contain "End partition B."
    And the description should contain "Partition C: The rescue, consisting of:"
    And the description should contain "Step. Hunter arrives"
    And the description should contain "Step. Hunter saves grandmother and Little Red Riding Hood"
    And the description should contain "Step. Wolf is punished"
    And the description should contain "End partition C."
    And the description should contain "Stop"

  Scenario: Activity diagram with while loop (English)
    Given the following PlantUML activity diagram:
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
    When I generate a description in English
    Then the description should contain "Start"
    And the description should contain "Repeat while data available? (yes), consisting of:"
    And the description should contain "Step. read data"
    And the description should contain "Step. process data"
    And the description should contain "End repeat."
    And the description should contain "Stop"

  Scenario: Activity diagram with fork/join (parallel activities - English)
    Given the following PlantUML activity diagram:
      """
      @startuml
      start
      :Prepare;
      fork
        :Task A;
      fork again
        :Task B;
      end fork
      :Finalize;
      stop
      @enduml
      """
    When I generate a description in English
    Then the description should contain "Start"
    And the description should contain "Step. Prepare"
    And the description should contain "Parallel execution 1, consisting of:"
    And the description should contain "Branch 1:"
    And the description should contain "Step. Task A"
    And the description should contain "Branch 2:"
    And the description should contain "Step. Task B"
    And the description should contain "End parallel execution 1."
    And the description should contain "Step. Finalize"
    And the description should contain "Stop"

  Scenario: Nested parallel execution with multiple items per branch (English)
    Given the following PlantUML activity diagram:
      """
      @startuml
      start
      fork
        :Task A1;
        :Task A2;
      fork again
        :Task B1;
        fork
          :Task B2a;
        fork again
          :Task B2b;
        end fork
        :Task B3;
      end fork
      stop
      @enduml
      """
    When I generate a description in English
    Then the description should contain "Start"
    And the description should contain "Parallel execution 1, consisting of:"
    And the description should contain "Branch 1:"
    And the description should contain "Step. Task A1"
    And the description should contain "Step. Task A2"
    And the description should contain "Branch 2:"
    And the description should contain "Step. Task B1"
    And the description should contain "Parallel execution 2, consisting of:"
    And the description should contain "Step. Task B2a"
    And the description should contain "Step. Task B2b"
    And the description should contain "End parallel execution 2."
    And the description should contain "Step. Task B3"
    And the description should contain "End parallel execution 1."
    And the description should contain "Stop"
