Feature: Mermaid pie chart descriptions (Dutch output)
  As a Dutch screen reader user
  I want accessible textual descriptions of pie charts in Dutch
  So that I can understand the data distribution without seeing the visual

  Scenario: Simple pie chart with programming languages (Dutch output)
    Given the following Mermaid pie chart:
      """
      pie showData
        title Gebruikte Programmeertalen
        "JavaScript" : 40
        "Python" : 30
        "TypeScript" : 20
        "Overig" : 10
      """
    When I generate a description in Dutch
    Then the description should start with:
      """
      Taartdiagram met titel "Gebruikte Programmeertalen" met 4 segmenten.
      """
    And the description should contain "JavaScript: 40 (40%)"
    And the description should contain "Python: 30 (30%)"
    And the description should contain "TypeScript: 20 (20%)"
    And the description should contain "Overig: 10 (10%)"

  Scenario: Pie chart without title (Dutch output)
    Given the following Mermaid pie chart:
      """
      pie showData
        "Eerste" : 50
        "Tweede" : 50
      """
    When I generate a description in Dutch
    Then the description should start with:
      """
      Taartdiagram met 2 segmenten.
      """
    And the description should contain "Eerste: 50 (50%)"
    And the description should contain "Tweede: 50 (50%)"

  Scenario: Pie chart without showData keyword (Dutch output)
    Given the following Mermaid pie chart:
      """
      pie
        title Programmeertalen
        "JavaScript" : 40
        "Python" : 30
        "TypeScript" : 20
        "Overig" : 10
      """
    When I generate a description in Dutch
    Then the description should start with:
      """
      Taartdiagram met titel "Programmeertalen" met 4 segmenten.
      """
    And the description should contain "JavaScript: 40 (40%)"
    And the description should contain "Python: 30 (30%)"
    And the description should contain "TypeScript: 20 (20%)"
    And the description should contain "Overig: 10 (10%)"

  Scenario: Pie chart with long data labels (Dutch output)
    Given the following Mermaid pie chart:
      """
      pie showData
        title Tijdsbesteding Ontwikkelaar
        "Code schrijven" : 35
        "Debuggen" : 25
        "Vergaderingen" : 20
        "Code Review" : 15
        "Documentatie" : 5
      """
    When I generate a description in Dutch
    Then the description should start with:
      """
      Taartdiagram met titel "Tijdsbesteding Ontwikkelaar" met 5 segmenten.
      """
    And the description should contain "Code schrijven: 35 (35%)"
    And the description should contain "Debuggen: 25 (25%)"
    And the description should contain "Code Review: 15 (15%)"
    And the description should contain "Documentatie: 5 (5%)"

  Scenario: Pie chart with unequal distribution (Dutch output)
    Given the following Mermaid pie chart:
      """
      pie showData
        title Marktaandeel Browsers
        "Chrome" : 63
        "Safari" : 19
        "Firefox" : 12
        "Edge" : 4
        "Overig" : 2
      """
    When I generate a description in Dutch
    Then the description should contain "Chrome: 63 (63%)"
    And the description should contain "Safari: 19 (19%)"
    And the description should contain "Firefox: 12 (12%)"
    And the description should contain "Edge: 4 (4%)"
    And the description should contain "Overig: 2 (2%)"
