Feature: English Domain Story descriptions
  As a screen reader user
  I want an ordered natural-language description for Domain Stories
  So that I can follow the story flow without seeing the diagram

  Scenario: Simple Domain Story activity in English
    Given the following PlantUML Domain Story:
      """
      @startuml
      !include <DomainStory/domainStory>
      !$Story_Layout = "left-to-right"
      Person(Alice, "Alice")
      Person(Bob, "Bob")
      activity(1, Alice, talks about the, Info: weather, with, Bob)
      @enduml
      """
    When I generate a description in English
    Then the first line should be:
      """
      Domain story with 1 activities.
      """
    And the description should contain "1. Alice talks about the weather with Bob."

  Scenario: Domain Story with 8 activities (Reis boeken as-is)
    Given the following PlantUML Domain Story:
      """
      @startuml
      !include <DomainStory/domainStory>
      !$Story_Layout = "left-to-right"

      Person(Reiziger, "Reiziger")
      System(Site, "Triptop Site")
      Person(Medewerker, "Medewerker")
      System(Intern, "Intern Systeem")

      activity(1, Reiziger, bekijkt, Info: reisvoorbeeelden, op, Site)
      activity(2, Reiziger, vult, Document: reisaanvraag, in, Site)
      activity(3, Site, stuurt, Document: reisaanvraag, naar, Medewerker)
      activity(4, Medewerker, stuurt, Info: reisvoorstel, naar, Reiziger)
      activity(5, Reiziger, stuurt, Info: wijzigingen, naar, Medewerker)
      activity(6, Reiziger, geeft, Info: reisbevestiging, aan, Medewerker)
      activity(7, Medewerker, Maakt, Info: Boeking, _, Intern)
      activity(8, Medewerker, genereert, Info: reis, voor, Reiziger)
      @enduml
      """
    When I generate a description in English
    Then the first line should be:
      """
      Domain story with 8 activities.
      """
    And the description should contain "1. Reiziger bekijkt reisvoorbeeelden op Triptop Site."
    And the description should contain "2. Reiziger vult reisaanvraag in Triptop Site."
    And the description should contain "3. Triptop Site stuurt reisaanvraag naar Medewerker."
    And the description should contain "4. Medewerker stuurt reisvoorstel naar Reiziger."
    And the description should contain "5. Reiziger stuurt wijzigingen naar Medewerker."
    And the description should contain "6. Reiziger geeft reisbevestiging aan Medewerker."
    And the description should contain "7. Medewerker Maakt Boeking Intern Systeem."
    And the description should contain "8. Medewerker genereert reis voor Reiziger."
