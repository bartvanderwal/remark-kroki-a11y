# Domain Models: Larman vs Fowler

This page provides several PlantUML diagrams as a test for the `remark-kroki-a11y` plugin, while also explaining the difference between two approaches to domain modeling and how this affects naming conventions for associations in class diagrams during the Analysis and Design phases of the Software Delivery lifecycle. The main distinction is the level of detail - less in analysis and more in design - as well as adherence to programming language conventions in naming.

PlantUML supports both styles, and the A11y descriptions must also support them to correctly enable screen readers to read out additional information.

## Two Phases of Modeling

When modeling a system, we distinguish two important phases:

1. **Analysis Phase** (Larman) - Focus on understanding the problem domain
2. **Design Phase** (Fowler) - Focus on technical implementation

## Larman: Domain Model in the Analysis Phase

Craig Larman describes the **conceptual domain model** in his book "Applying UML and Patterns". This model:

- Uses **natural language** for association names
- Is intended for communication with domain experts and stakeholders
- Focuses on **understanding the domain**, not code
- Avoids technical jargon

### Example: Webshop domain model (Larman-style)

```kroki imgType="plantuml" imgTitle="Larman domain model webshop" lang="en"
@startuml
class Order {
  orderDate
  totalAmount
}

class Customer {
  name
  email
}

class Product {
  name
  price
}

class Address {
  street
  houseNumber
  postalCode
  city
}

Order --> Customer : placed by
Order --> "1..*" Product : contains
Customer --> "0..*" Address : has as shipping address
Customer --> "1" Address : has as billing address
@enduml
```

Note the association names:
- "placed by" - natural language with spaces
- "contains" - verb describing the relationship
- "has as shipping address" - complete phrase providing context

## Fowler: Domain Model in the Design Phase

Martin Fowler describes the **implementation domain model** in "Patterns of Enterprise Application Architecture". This model:

- Uses **camelCase** naming that translates directly to code
- Is intended for developers
- Focuses on **technical correctness**
- Attributes and association names are directly usable as variable names

### Example: Webshop domain model (Fowler-style)

```kroki imgType="plantuml" imgTitle="Fowler domain model webshop" lang="en"
@startuml
class Order {
  -orderDate: LocalDate
  -totalAmount: BigDecimal
}

class Customer {
  -name: String
  -email: String
}

class Product {
  -name: String
  -price: BigDecimal
}

class Address {
  -street: String
  -houseNumber: String
  -postalCode: String
  -city: String
}

Order --> Customer : placedBy
Order --> "1..*" Product : products
Customer --> "0..*" Address : shippingAddresses
Customer --> "1" Address : billingAddress
@enduml
```

Note the differences:
- "placedBy" - camelCase, directly usable as attribute name
- "products" - plural for collections
- Data types are added (String, LocalDate, BigDecimal)
- Access modifiers are explicit (-private)

## Comparison

| Aspect | Larman (Analysis) | Fowler (Design) |
|--------|-------------------|-----------------|
| Goal | Domain understanding | Implementation |
| Audience | Stakeholders, domain experts | Developers |
| Naming | Natural language | camelCase |
| Example | "placed by" | "placedBy" |
| Data types | Optional/conceptual | Technically specific |

## When to Use Which Model?

### Use Larman-style when:
- Communicating with non-technical stakeholders
- Still exploring the problem domain
- Creating documentation for domain experts
- Doing Event Storming or Domain Discovery

### Use Fowler-style when:
- Working on technical design
- About to generate or write code
- Communicating with the development team
- Designing APIs or database schemas

## Combining Both Styles

In practice, you can combine both approaches by first creating a Larman-style domain model for understanding, then refining it into a Fowler-style model for implementation.

```kroki imgType="plantuml" imgTitle="Domain model evolution" lang="en"
@startuml
class "Analysis: Order" as Order1 {
  orderDate
  totalAmount
}

class "Analysis: Customer" as Customer1 {
  name
}

class "Design: Order" as Order2 {
  -orderDate: LocalDate
  -totalAmount: BigDecimal
}

class "Design: Customer" as Customer2 {
  -name: String
}

Order1 --> Customer1 : placed by
Order2 --> Customer2 : placedBy

Order1 ..> Order2 : refines to
Customer1 ..> Customer2 : refines to
@enduml
```

## Conclusion

Both modeling styles have their place in the software development process:

- **Larman** helps with understanding and communicating about the domain
- **Fowler** helps with building a solid technical implementation

The choice depends on your audience and the purpose of the model. Remember that models are communication tools - choose the style that best communicates with your target audience.
