# language: en
Feature: C4 container diagram descriptions
  As a screen reader user
  I want accessible textual descriptions of C4 container diagrams
  So that I can understand the deployment landscape without seeing the visual

  Scenario: Container diagram with system boundary and multiple containers
    Given the following PlantUML C4 container diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

      title Container Diagram: Local Development Setup

      Person(author, "Content Author", "Writes Markdown with diagram code blocks")

      System_Boundary(host, "Host Machine") {
          Container(docusaurus, "Docusaurus Dev Server", "Node.js", "Builds and serves documentation site with hot reload")
          Container(plugin, "remark-kroki-a11y", "npm package", "Remark plugin that parses diagrams and generates accessible descriptions")
      }

      System_Boundary(docker, "Docker") {
          Container(kroki, "Kroki", "Docker container", "Diagram rendering gateway")
          Container(mermaid, "kroki-mermaid", "Docker container", "Renders Mermaid diagrams to SVG")
      }

      Rel(author, docusaurus, "writes Markdown files to")
      Rel(docusaurus, plugin, "processes Markdown through")
      Rel(plugin, kroki, "requests diagram images from")
      Rel(kroki, mermaid, "delegates Mermaid diagrams to")

      @enduml
      """
    When I generate a description in English
    Then the description should contain "C4 Container diagram for Host Machine with:"
    And the description should contain "1 actor: Content Author"
    And the description should contain "4 containers:"
    And the description should contain "Docusaurus Dev Server (Node.js)"
    And the description should contain "remark-kroki-a11y (npm package)"
    And the description should contain "Kroki (Docker container)"
    And the description should contain "kroki-mermaid (Docker container)"
    And the description should contain "4 relationships:"
    And the description should contain "<li>Content Author writes Markdown files to Docusaurus Dev Server</li>"
    And the description should contain "<li>Docusaurus Dev Server processes Markdown through remark-kroki-a11y</li>"
    And the description should contain "<li>remark-kroki-a11y requests diagram images from Kroki</li>"
    And the description should contain "<li>Kroki delegates Mermaid diagrams to kroki-mermaid</li>"

  Scenario: Container diagram with database container
    Given the following PlantUML C4 container diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

      System_Boundary(system, "Web Application") {
          Container(webapp, "Web App", "React", "Frontend application")
          Container(api, "API Server", "Node.js", "Backend REST API")
          ContainerDb(db, "Database", "PostgreSQL", "Stores user data")
      }

      Rel(webapp, api, "calls")
      Rel(api, db, "reads from and writes to")

      @enduml
      """
    When I generate a description in English
    Then the description should contain "C4 Container diagram for Web Application with:"
    And the description should contain "3 containers:"
    And the description should contain "Web App (React)"
    And the description should contain "API Server (Node.js)"
    And the description should contain "Database (PostgreSQL) [database]"
    And the description should contain "2 relationships:"
    And the description should contain "<li>Web App calls API Server</li>"
    And the description should contain "<li>API Server reads from and writes to Database</li>"

  Scenario: Container diagram with external systems
    Given the following PlantUML C4 container diagram:
      """
      @startuml
      !include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

      Person(user, "User", "End user")

      System_Boundary(app, "Application") {
          Container(frontend, "Frontend", "Vue.js", "User interface")
      }

      System_Ext(auth, "Auth Provider", "External authentication service")

      Rel(user, frontend, "uses")
      Rel(frontend, auth, "authenticates via")

      @enduml
      """
    When I generate a description in English
    Then the description should contain "C4 Container diagram for Application with:"
    And the description should contain "1 actor: User"
    And the description should contain "1 container: Frontend (Vue.js)"
    And the description should contain "1 external system: Auth Provider"
    And the description should contain "2 relationships:"
    And the description should contain "<li>User uses Frontend</li>"
    And the description should contain "<li>Frontend authenticates via Auth Provider</li>"
