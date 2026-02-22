---
sidebar_label: Domain Stories (PlantUML)
---

# Domain Stories (PlantUML)

This page demonstrates a Domain Story rendered via PlantUML using the
DomainStory-PlantUML macro library:

- Project: [johthor/DomainStory-PlantUML](https://github.com/johthor/DomainStory-PlantUML)

Domain Storytelling can be a useful bridge between conceptual domain models and
more technical UML design models.

## DomainStory-PlantUML syntax (reference)

The official macro-based notation uses an include from the DomainStory-PlantUML
project:

```plantuml
@startuml
!includeurl https://raw.githubusercontent.com/johthor/DomainStory-PlantUML/main/domainStory.puml

!$Story_Layout = "left-to-right"
Person(Customer, "Customer")
System(TicketMachine, "Ticket Machine")
activity(1, Customer, selects, Info: Movie, at, TicketMachine)
@enduml
```

## Example: Story flow (rendered in this test site)

To keep this test site build-stable across environments, we render a plain
PlantUML story-flow diagram here.

```kroki imgType="plantuml" imgTitle="Domain Story: Cinema Visit" lang="en" a11yDescriptionOverride="Domain Story with actors Customer, TicketMachine, and CinemaStaff. The story shows the customer selecting a movie, paying, receiving a ticket, and entering the cinema."
@startuml
title Cinema Visit Story Flow
participant Customer
participant "Ticket Machine" as TicketMachine
participant "Cinema Staff" as Staff

Customer -> TicketMachine : selects movie
Customer -> TicketMachine : pays
TicketMachine -> Customer : prints ticket
Customer -> Staff : shows ticket
Staff -> Customer : allows entry
@enduml
```

## Why this matters

- Domain Stories are often easier to validate with non-technical stakeholders.
- Work objects (ticket, payment, request, etc.) become explicit in the model.
- The flow can be validated early, before committing to technical class/method
  design details.
