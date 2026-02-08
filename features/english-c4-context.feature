# language: en
Feature: C4 context diagram descriptions
  As a screen reader user
  I want accessible textual descriptions of C4 context diagrams
  So that I can understand the system architecture without seeing the visual

  Scenario: Simple C4 context diagram with remark-kroki-a11y plugin
    Given the following PlantUML C4 context diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

      title System Context: remark-kroki-a11y Plugin

      Person(author, "Content Author", "Writes documentation with PlantUML/Mermaid diagrams")
      Person(reader, "Reader", "Consumes documentation, possibly using assistive technology")

      System(plugin, "remark-kroki-a11y", "Remark plugin that adds accessible descriptions to diagrams")

      System_Ext(ssg, "Static Site Generator", "Docusaurus, mdBook, Jekyll, etc.")
      System_Ext(kroki, "Kroki Service", "Renders diagrams to SVG/PNG")
      System_Ext(browser, "Web Browser", "Renders final HTML with diagrams and descriptions")

      Rel(author, ssg, "Writes Markdown with diagrams to")
      Rel(ssg, plugin, "Processes Markdown via remark pipeline through")
      Rel(plugin, kroki, "Requests diagram images from")
      Rel(ssg, browser, "Generates HTML site to")
      Rel(reader, browser, "Views documentation on")

      SHOW_LEGEND()
      @enduml
      """
    When I generate a description in English
    Then the description should start with:
      """
      C4 System Context diagram with:
      """
    And the description should contain "2 actors: Content Author, Reader"
    And the description should contain "4 systems:"
    And the description should contain "remark-kroki-a11y"
    And the description should contain "Static Site Generator"
    And the description should contain "Kroki Service"
    And the description should contain "Web Browser"
    And the description should contain "5 relationships:"
    And the description should contain "Content Author writes Markdown with diagrams to Static Site Generator"
    And the description should contain "Static Site Generator processes Markdown via remark pipeline through remark-kroki-a11y"
    And the description should contain "remark-kroki-a11y requests diagram images from Kroki Service"
    And the description should contain "Static Site Generator generates HTML site to Web Browser"
    And the description should contain "Reader views documentation on Web Browser"

  Scenario: C4 context with multiple actors and systems
    Given the following PlantUML C4 context diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

      title E-Commerce System Context

      Person(customer, "Customer", "A person who buys products")
      Person(admin, "Administrator", "Manages the platform")

      System(ecommerce, "E-Commerce System", "Allows customers to buy products")
      System_Ext(payment, "Payment Gateway", "Processes credit card transactions")
      System_Ext(email, "Email System", "Sends order confirmations")

      Rel(customer, ecommerce, "Places orders")
      Rel(ecommerce, payment, "Requests payment")
      Rel(ecommerce, email, "Sends confirmation emails")
      Rel(admin, ecommerce, "Manages products")

      SHOW_LEGEND()
      @enduml
      """
    When I generate a description in English
    Then the description should start with:
      """
      C4 System Context diagram with:
      """
    And the description should contain "2 actors: Customer, Administrator"
    And the description should contain "3 systems:"
    And the description should contain "E-Commerce System"
    And the description should contain "4 relationships:"

  Scenario: C4 context with only internal system (no external systems)
    Given the following PlantUML C4 context diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

      title Simple System

      Person(user, "User", "A person")

      System(app, "Application", "The main system")

      Rel(user, app, "Uses")

      SHOW_LEGEND()
      @enduml
      """
    When I generate a description in English
    Then the description should contain "1 actor: User"
    And the description should contain "1 system:"
    And the description should contain "Application"
    And the description should contain "1 relationship:"
    And the description should contain "User uses Application"

  Scenario: C4 context distinguishes between internal and external systems
    Given the following PlantUML C4 context diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

      title System with External Dependencies

      Person(user, "User", "End user")

      System(core, "Core System", "The main application")
      System_Ext(api, "Third-party API", "External service")

      Rel(user, core, "Interacts with")
      Rel(core, api, "Calls")

      SHOW_LEGEND()
      @enduml
      """
    When I generate a description in English
    Then the description should contain "1 internal system: Core System"
    And the description should contain "1 external system: Third-party API"
    And the description should contain "Core System calls Third-party API"
