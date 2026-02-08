# language: en
Feature: Speak Out Loud button for diagram descriptions
  As a sighted user
  I want to hear how a diagram description sounds
  So that I can understand the experience of visually impaired users with screen readers

  Scenario: Speak button appears when enabled
    Given the following Mermaid pie chart:
      """
      pie showData
        title Programming Languages
        "JavaScript" : 40
        "Python" : 30
      """
    And speak button is enabled
    When I generate a description in English
    Then the description should contain a speak button

  Scenario: Speak button does not appear when disabled
    Given the following Mermaid pie chart:
      """
      pie showData
        title Programming Languages
        "JavaScript" : 40
        "Python" : 30
      """
    And speak button is disabled
    When I generate a description in English
    Then the description should not contain a speak button

