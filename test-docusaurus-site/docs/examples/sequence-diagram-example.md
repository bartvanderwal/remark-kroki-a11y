# Sequentiediagram: Bestelling in een Café

Dit voorbeeld toont hoe een sequentiediagram de interactie tussen objecten weergeeft als methode-aanroepen.

## Alice bestelt een drankje bij Bob

```kroki imgType="plantuml" imgTitle="Café bestelling" lang="nl" customDescription="Zie toelichting onder dit diagram voor beschrijving van de interactie."
@startuml
autonumber

actor "Alice\n(klant)" as Alice
participant "Bob\n(ober)" as Bob
participant "wallet:\nWallet" as Wallet

Alice -> Bob: bestelDrankje("appelsap")
Bob --> Alice: betaal(2.00)

Alice -> Wallet: betaal(2.00)
Wallet --> Alice: bevestiging(walletId="ere-34-23")

Alice --> Bob: betaald(2.00, walletId="ere-34-23")
Bob --> Alice: geefDrankje("appelsap")
Bob -> Alice: "Enjoy!"

@enduml
```

### Toelichting bij het diagram

Het sequentiediagram hierboven toont de volgende interactie:

1. **Alice bestelt** - Alice roept de methode `bestelDrankje("appelsap")` aan bij Bob
2. **Bob vraagt betaling** - Bob retourneert een verzoek `betaal(2.00)` aan Alice
3. **Alice betaalt** - Alice roept `betaal(2.00)` aan op haar Wallet object
4. **Wallet bevestigt** - De Wallet retourneert een bevestiging met wallet ID "ere-34-23"
5. **Alice bevestigt aan Bob** - Alice stuurt de betaalbevestiging door naar Bob
6. **Bob geeft drankje** - Bob roept `geefDrankje("appelsap")` aan en zegt "Enjoy!"

### Waarom customDescription?

Dit diagram gebruikt `customDescription` omdat:
- Sequentiediagrammen nog niet automatisch worden geparsed
- De toelichting in de tekst een betere context geeft dan een automatisch gegenereerde beschrijving zou kunnen

---

## Zonder customDescription: "niet ondersteund" melding

Hieronder hetzelfde diagram, maar zonder `customDescription`. De plugin toont dan automatisch een melding dat sequentiediagrammen nog niet ondersteund worden:

```kroki imgType="plantuml" imgTitle="Café bestelling (zonder override)" lang="nl"
@startuml
autonumber
actor "Alice\n(klant)" as Alice
participant "Bob\n(ober)" as Bob

Alice -> Bob: bestelDrankje("appelsap")
Bob --> Alice: betaal(2.00)
Bob --> Alice: geefDrankje("appelsap")
@enduml
```

Klik op de "Natuurlijke taal" tab hierboven om de automatische melding te zien.

---

## Vergelijk met het klassieke Alice & Bob voorbeeld

Het simpele "Hello World" voorbeeld toont alleen berichten, geen methode-semantiek:

```kroki imgType="plantuml" imgTitle="Klassiek Alice & Bob" lang="en"
@startuml
Alice -> Bob: Hello Bob!
Bob --> Alice: Hi Alice!
@enduml
```

Het café-voorbeeld hierboven is realistischer voor software design omdat:
- De berichten lijken op **methode-aanroepen** met parameters
- Er is een **return value** (bevestiging)
- Er is een derde object (**Wallet**) dat Alice gebruikt
