# Domeinmodellen: Larman vs Fowler

Deze pagina geeft een aantal plantuml diagrammen als test voor de `remark-kroki-a11y` plugin, en gebruikt de gelegnehid ook om direct het verschil uit tussen twee benaderingen van domeinmodellering uit te leggen. En hoe dit invloed heeft op de naamgeving van associaties in klassendiagrammen. In de Analyse fase en de Ontwerp fase van de Software Delivery lifecycle. Het hoofd onderscheid is de mate van detail , analyse minder en bij ontwerpen meer. En ook het aansluiten bij conventies in een programmeertaal in naamgeving.

Beide situaties ondersteunt plantuml, en moet de A11y dus ook ondersteunen, om extra informatie ook correct op te kunnen laten lezen door een screenreader.

## Twee fasen van modellering

Bij het modelleren van een systeem onderscheiden we twee belangrijke fasen:

1. **Analysefase** (Larman) - Focus op het begrijpen van het probleemdomein
2. **Ontwerpfase** (Fowler) - Focus op de technische implementatie

## Larman: Domeinmodel in de Analysefase

Craig Larman beschrijft in zijn boek "Applying UML and Patterns" het **conceptuele domeinmodel**. Dit model:

- Gebruikt **natuurlijke taal** voor associatienamen
- Is bedoeld voor communicatie met domeinexperts en stakeholders
- Focust op **begrip van het domein**, niet op code
- Vermijdt technisch jargon

### Voorbeeld: Webshop domeinmodel (Larman-stijl)

```kroki imgType="plantuml" imgTitle="Larman domeinmodel webshop" lang="nl"
@startuml
class Bestelling {
  besteldatum
  totaalbedrag
}

class Klant {
  naam
  email
}

class Product {
  naam
  prijs
}

class Adres {
  straat
  huisnummer
  postcode
  plaats
}

Bestelling --> Klant : geplaatst door
Bestelling --> "1..*" Product : bevat
Klant --> "0..*" Adres : heeft als afleveradres
Klant --> "1" Adres : heeft als factuuradres
@enduml
```

Let op de associatienamen:
- "geplaatst door" - natuurlijke taal met spaties
- "bevat" - werkwoord dat de relatie beschrijft
- "heeft als afleveradres" - volledige zin die de context geeft

## Fowler: Domeinmodel in de Ontwerpfase

Martin Fowler beschrijft in "Patterns of Enterprise Application Architecture" het **implementatie-domeinmodel**. Dit model:

- Gebruikt **camelCase** naamgeving die direct naar code vertaalt
- Is bedoeld voor ontwikkelaars
- Focust op **technische correctheid**
- Attributen en associatienamen zijn direct bruikbaar als variabelenamen

### Voorbeeld: Webshop domeinmodel (Fowler-stijl)

```kroki imgType="plantuml" imgTitle="Fowler domeinmodel webshop" lang="nl"
@startuml
class Bestelling {
  -besteldatum: LocalDate
  -totaalbedrag: BigDecimal
}

class Klant {
  -naam: String
  -email: String
}

class Product {
  -naam: String
  -prijs: BigDecimal
}

class Adres {
  -straat: String
  -huisnummer: String
  -postcode: String
  -plaats: String
}

Bestelling --> Klant : geplaatstDoor
Bestelling --> "1..*" Product : producten
Klant --> "0..*" Adres : afleveradressen
Klant --> "1" Adres : factuuradres
@enduml
```

Let op de verschillen:
- "geplaatstDoor" - camelCase, direct bruikbaar als attribuutnaam
- "producten" - meervoud voor collecties
- Datatypes zijn toegevoegd (String, LocalDate, BigDecimal)
- Access modifiers zijn expliciet (-private)

## Vergelijking

| Aspect | Larman (Analyse) | Fowler (Ontwerp) |
|--------|------------------|------------------|
| Doel | Domeinbegrip | Implementatie |
| Publiek | Stakeholders, domeinexperts | Ontwikkelaars |
| Naamgeving | Natuurlijke taal | camelCase |
| Voorbeeld | "geplaatst door" | "geplaatstDoor" |
| Datatypes | Optioneel/conceptueel | Technisch specifiek |

## Wanneer welk model?

### Gebruik Larman-stijl als je:
- Met niet-technische stakeholders communiceert
- Het probleemdomein nog aan het verkennen bent
- Documentatie maakt voor domeinexperts
- Event Storming of Domain Discovery doet

### Gebruik Fowler-stijl als je:
- Het technisch ontwerp uitwerkt
- Code gaat genereren of schrijven
- Met het ontwikkelteam communiceert
- API's of database schemas ontwerpt

## Beide stijlen gecombineerd

In de praktijk kun je beide benaderingen combineren door eerst een Larman-stijl domeinmodel te maken voor begrip, en dit vervolgens te verfijnen naar een Fowler-stijl model voor implementatie.

```kroki imgType="plantuml" imgTitle="Evolutie van domeinmodel" lang="nl"
@startuml
class "Analyse: Bestelling" as Bestelling1 {
  besteldatum
  totaalbedrag
}

class "Analyse: Klant" as Klant1 {
  naam
}

class "Ontwerp: Bestelling" as Bestelling2 {
  -besteldatum: LocalDate
  -totaalbedrag: BigDecimal
}

class "Ontwerp: Klant" as Klant2 {
  -naam: String
}

Bestelling1 --> Klant1 : geplaatst door
Bestelling2 --> Klant2 : geplaatstDoor

Bestelling1 ..> Bestelling2 : verfijnt naar
Klant1 ..> Klant2 : verfijnt naar
@enduml
```

## Conclusie

Beide modelleringsstijlen hebben hun plaats in het softwareontwikkelingsproces:

- **Larman** helpt bij het begrijpen en communiceren over het domein
- **Fowler** helpt bij het bouwen van een solide technische implementatie

De keuze hangt af van je publiek en het doel van het model. Vergeet niet dat modellen communicatiemiddelen zijn - kies de stijl die het beste communiceert met je doelgroep.
