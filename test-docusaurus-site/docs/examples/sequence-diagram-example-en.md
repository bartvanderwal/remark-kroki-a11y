---
sidebar_label: Sequence Diagram
---

# Sequence Diagrams

This example shows how a sequence diagram represents the interaction between objects as messages or method calls.

## Simple message exchange: Alice & Bob

The classic "Hello World" of sequence diagrams shows simple messages between two participants:

```kroki imgType="plantuml" imgTitle="Classic Alice & Bob" lang="en"
@startuml
Alice -> Bob: Hello Bob!
Bob --> Alice: Hi Alice!
@enduml
```

This minimal example demonstrates:

- **Participants** are automatically created from the names used
- **Solid arrows** (`->`) represent synchronous messages
- **Dashed arrows** (`-->`) represent responses

---

## Method calls with types: Café ordering

In software design, we use typed participants to show which **class** or **role** an object has. The syntax `alice: Customer` means "alice of type Customer".

```kroki imgType="plantuml" imgTitle="Café order with typed participants" lang="en"
@startuml
autonumber

actor "alice: Customer" as alice
participant "bob: Waiter" as bob
participant "wallet: Wallet" as wallet

alice -> bob: orderDrink("apple juice")
bob --> alice: pay(2.00)

alice -> wallet: pay(2.00)
wallet --> alice: confirmation(walletId="ere-34-23")

alice --> bob: paid(2.00, walletId="ere-34-23")
bob --> alice: serveDrink("apple juice")
bob -> alice: "Enjoy!"

@enduml
```

This example is more realistic for software design because:

- Participants have **types** (Customer, Waiter, Wallet)
- The messages resemble **method calls** with parameters
- There is a **return value** (confirmation)
- There is a third object (**wallet**) that alice uses

---

## With a11yDescriptionOverride

When the automatically generated description isn't suitable, you can provide a manual override using the `a11yDescriptionOverride` attribute. This is useful when you want to refer to an explanation in the surrounding text:

```kroki imgType="plantuml" imgTitle="Café order" lang="en" a11yDescriptionOverride="Sequence diagram showing a café ordering flow. See the explanation below for a step-by-step description."
@startuml
autonumber

actor "alice: Customer" as alice
participant "bob: Waiter" as bob

alice -> bob: orderDrink("apple juice")
bob --> alice: pay(2.00)
bob --> alice: serveDrink("apple juice")
@enduml
```

### Explanation of the diagram

The sequence diagram above shows the following interaction:

1. **alice orders** - alice calls `orderDrink("apple juice")` on bob
2. **bob requests payment** - bob returns `pay(2.00)` to alice
3. **bob serves** - bob calls `serveDrink("apple juice")` on alice

The `a11yDescriptionOverride` is useful when:

- The explanation in the surrounding text provides better context
- The diagram type doesn't have automatic parsing support yet
- You want to provide a more tailored description for your audience
