Feature: English sequence diagram descriptions
  As a screen reader user
  I want accessible textual descriptions of sequence diagrams in English
  So that I can understand the interactions between participants

  Scenario: Simple sequence diagram with method calls (English)
    Given the following Mermaid sequence diagram:
      """
      sequenceDiagram
          participant Alice
          participant Bob
          participant Server
          Alice->>Server: login(username, password)
          Server-->>Alice: authToken
          Alice->>Bob: sendMessage(text)
          Bob-->>Alice: received
      """
    When I generate a description in English
    Then the first line should be:
      """
      Sequence diagram with 3 participants: Alice, Bob and Server.
      """
    And the description should contain "Alice calls Server.login(username, password)"
    And the description should contain "Server responds to Alice: authToken"
    And the description should contain "Alice calls Bob.sendMessage(text)"
    And the description should contain "Bob responds to Alice: received"

  Scenario: PlantUML sequence diagram with typed participants (English)
    Given the following PlantUML sequence diagram:
      """
      @startuml
      participant "user:\nCustomer" as user
      participant "cart:\nShoppingCart" as cart
      participant "payment:\nPaymentService" as payment

      user -> cart: addItem(product)
      user -> cart: checkout()
      cart -> payment: processPayment(amount)
      payment --> cart: confirmation
      cart --> user: orderComplete
      @enduml
      """
    When I generate a description in English
    Then the first line should be:
      """
      Sequence diagram with 3 participants: user of type Customer, cart of type ShoppingCart and payment of type PaymentService.
      """
    And the description should contain "user calls cart.addItem(product)"
    And the description should contain "user calls cart.checkout()"
    And the description should contain "cart calls payment.processPayment(amount)"
    And the description should contain "payment responds to cart: confirmation"
    And the description should contain "cart responds to user: orderComplete"
