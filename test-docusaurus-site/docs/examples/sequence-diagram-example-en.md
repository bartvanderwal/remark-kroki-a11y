---
sidebar_label: Sequence Diagram
---

# Sequence Diagram: Order in a Café

This example shows how a sequence diagram represents the interaction between objects as method calls.

## Alice orders a drink from Bob

```kroki imgType="plantuml" imgTitle="Café order" lang="en" customDescription="See explanation below this diagram for a description of the interaction."
@startuml
autonumber

actor "Alice\n(customer)" as Alice
participant "Bob\n(waiter)" as Bob
participant "wallet:\nWallet" as Wallet

Alice -> Bob: orderDrink("apple juice")
Bob --> Alice: pay(2.00)

Alice -> Wallet: pay(2.00)
Wallet --> Alice: confirmation(walletId="ere-34-23")

Alice --> Bob: paid(2.00, walletId="ere-34-23")
Bob --> Alice: serveDrink("apple juice")
Bob -> Alice: "Enjoy!"

@enduml
```

### Explanation of the diagram

The sequence diagram above shows the following interaction:

1. **Alice orders** - Alice calls the method `orderDrink("apple juice")` on Bob
2. **Bob requests payment** - Bob returns a request `pay(2.00)` to Alice
3. **Alice pays** - Alice calls `pay(2.00)` on her Wallet object
4. **Wallet confirms** - The Wallet returns a confirmation with wallet ID "ere-34-23"
5. **Alice confirms to Bob** - Alice forwards the payment confirmation to Bob
6. **Bob serves drink** - Bob calls `serveDrink("apple juice")` and says "Enjoy!"

### Why customDescription?

This diagram uses `customDescription` because:
- Sequence diagrams are not yet automatically parsed
- The explanation in the text provides better context than an automatically generated description could

---

## Without customDescription: "not supported" message

Below is the same diagram, but without `customDescription`. The plugin then automatically shows a message that sequence diagrams are not yet supported:

```kroki imgType="plantuml" imgTitle="Café order (without override)" lang="en"
@startuml
autonumber
actor "Alice\n(customer)" as Alice
participant "Bob\n(waiter)" as Bob

Alice -> Bob: orderDrink("apple juice")
Bob --> Alice: pay(2.00)
Bob --> Alice: serveDrink("apple juice")
@enduml
```

---

## Compare with the classic Alice & Bob example

The simple "Hello World" example shows only messages, no method semantics:

```kroki imgType="plantuml" imgTitle="Classic Alice & Bob" lang="en"
@startuml
Alice -> Bob: Hello Bob!
Bob --> Alice: Hi Alice!
@enduml
```

The café example above is more realistic for software design because:
- The messages resemble **method calls** with parameters
- There is a **return value** (confirmation)
- There is a third object (**Wallet**) that Alice uses
