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
    And the description should contain "Step 1. Decision: Graphviz installed?"
    And the description should contain "Yes: process all diagrams"
    And the description should contain "No: process only sequence and activity diagrams"
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
    And the description should contain "Step 1. Mother gives order"
    And the description should contain "Partition A: Journey to grandmother"
    And the description should contain "Step A1. Little Red Riding Hood departs"
    And the description should contain "Step A2. Meeting with wolf"
    And the description should contain "Step A3. Wolf runs ahead"
    And the description should contain "Partition B: At grandmother's house"
    And the description should contain "Step B1. Wolf eats grandmother"
    And the description should contain "Step B2. Wolf disguises itself"
    And the description should contain "Step B3. Little Red Riding Hood arrives"
    And the description should contain "Step B4. Wolf eats Little Red Riding Hood"
    And the description should contain "Partition C: The rescue"
    And the description should contain "Step C1. Hunter arrives"
    And the description should contain "Step C2. Hunter saves grandmother and Little Red Riding Hood"
    And the description should contain "Step C3. Wolf is punished"
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
    And the description should contain "Step 1. Repeat while data available? (yes):"
    And the description should contain "Step 1.1. read data"
    And the description should contain "Step 1.2. process data"
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
    And the description should contain "Step 1. Prepare"
    And the description should contain "Step 2. Parallel execution:"
    And the description should contain "Step 2.1. Task A"
    And the description should contain "Step 2.2. Task B"
    And the description should contain "Step 3. Finalize"
    And the description should contain "Stop"