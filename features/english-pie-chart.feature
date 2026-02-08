# language: en
Feature: Mermaid pie chart descriptions
  As a screen reader user
  I want accessible textual descriptions of pie charts
  So that I can understand the data distribution without seeing the visual

  Scenario: Simple pie chart with programming languages (English)
    Given the following Mermaid pie chart:
      """
      pie showData
        title Programming Languages Used
        "JavaScript" : 40
        "Python" : 30
        "TypeScript" : 20
        "Other" : 10
      """
    When I generate a description in English
    Then the description should start with:
      """
      Pie chart with title "Programming Languages Used" showing 4 segments.
      """
    And the description should contain "JavaScript: 40 (40%)"
    And the description should contain "Python: 30 (30%)"
    And the description should contain "TypeScript: 20 (20%)"
    And the description should contain "Other: 10 (10%)"

  Scenario: Pie chart without title (English)
    Given the following Mermaid pie chart:
      """
      pie showData
        "First" : 50
        "Second" : 50
      """
    When I generate a description in English
    Then the description should start with:
      """
      Pie chart showing 2 segments.
      """
    And the description should contain "First: 50 (50%)"
    And the description should contain "Second: 50 (50%)"

  Scenario: Pie chart without showData keyword (English)
    Given the following Mermaid pie chart:
      """
      pie
        title Programming Languages
        "JavaScript" : 40
        "Python" : 30
        "TypeScript" : 20
        "Other" : 10
      """
    When I generate a description in English
    Then the description should start with:
      """
      Pie chart with title "Programming Languages" showing 4 segments.
      """
    And the description should contain "JavaScript: 40 (40%)"
    And the description should contain "Python: 30 (30%)"
    And the description should contain "TypeScript: 20 (20%)"
    And the description should contain "Other: 10 (10%)"

  Scenario: Pie chart with long data labels (English)
    Given the following Mermaid pie chart:
      """
      pie showData
        title Developer Time Allocation
        "Writing Code" : 35
        "Debugging" : 25
        "Meetings" : 20
        "Code Review" : 15
        "Documentation" : 5
      """
    When I generate a description in English
    Then the description should start with:
      """
      Pie chart with title "Developer Time Allocation" showing 5 segments.
      """
    And the description should contain "Writing Code: 35 (35%)"
    And the description should contain "Debugging: 25 (25%)"
    And the description should contain "Code Review: 15 (15%)"
    And the description should contain "Documentation: 5 (5%)"

  Scenario: Pie chart with unequal distribution (English)
    Given the following Mermaid pie chart:
      """
      pie showData
        title Browser Market Share
        "Chrome" : 63
        "Safari" : 19
        "Firefox" : 12
        "Edge" : 4
        "Other" : 2
      """
    When I generate a description in English
    Then the description should contain "Chrome: 63 (63%)"
    And the description should contain "Safari: 19 (19%)"
    And the description should contain "Firefox: 12 (12%)"
    And the description should contain "Edge: 4 (4%)"
    And the description should contain "Other: 2 (2%)"
