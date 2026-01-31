# Stories in natuurlijke taal vs code in formele programmeertaal

Dit voorbeeld toont hoe je een verhaal in natuurlijke taal (het sprookje van Roodkapje) kunt vertalen naar formele diagrammen. We splitsen het verhaal op in drie delen om een "God Diagram" te voorkomen. Een God diagram is een anti-pattern, net als een 'God class' dat is. Het opsplitsen is een best practice om 'cognitive load' te voorkomen. Om wel ook het overzicht te geven maak je weer een apart diagram, die de onderlinge verbanden aangeeft. Dit is vergelijkbaar met hoe in C4 er ook verschillende zoomniveaus zijn.

---

## Er was eens...

Voordat we het verhaal in sequentiediagrammen vertellen, definiëren we eerst de "wereld" van het sprookje in een klassediagram. Dit is vergelijkbaar met hoe je in software eerst je domeinmodel opstelt voordat je de use cases uitwerkt.

```kroki imgType="plantuml" imgTitle="Roodkapje: Domeinmodel" lang="nl" customDescription="Klassendiagram met alle karakters en objecten uit het Roodkapje-verhaal. Roodkapje heeft een mandje met koekjes en wijn. De Wolf heeft methodes om te vermommen en op te eten. Oma woont in een huis in het bos. De Jager heeft een schaar en kan de buik openknippen en vullen met stenen."
@startuml
!theme plain
title Er was eens... het domeinmodel van Roodkapje

class Roodkapje {
  -naam: String = "Roodkapje"
  -heeftKapje: boolean = true
  +vertrek()
  +klop()
  +vraag(tekst: String)
  +haalStenen(): Steen[]
}

class Moeder {
  -naam: String
  +geefMandje(inhoud: Object[]): Mandje
  +geefOpdracht(tekst: String)
}

class Mandje {
  -koekjes: Koekje[]
  -wijn: Fles
}

class Wolf {
  -honger: boolean = true
  -vermomming: String = null
  +vraag(tekst: String): String
  +bedenktPlan()
  +neem(route: Route, bestemming: Locatie)
  +vermom(als: Persoon)
  +eetOp(slachtoffer: Persoon)
  +gaInBed()
}

class Oma {
  -naam: String
  -ziek: boolean = true
  +openDeur()
}

class Jager {
  -schaar: Schaar
  +hoort(geluid: String)
  +besluit(actie: String)
  +knipBuikOpen(wolf: Wolf)
  +naai(buik: String)
}

class Huis {
  -locatie: String = "diep in het bos"
  -heeftBed: boolean = true
}

class Steen {
  -gewicht: int
}

Moeder --> Roodkapje : is moeder van
Roodkapje --> Mandje : draagt
Oma --> Huis : woont in
Wolf --> Oma : bezoekt
Wolf --> Oma : eet op
Wolf --> Roodkapje : ontmoet
Wolf --> Roodkapje : eet op
Jager --> Wolf : opent buik van
Jager --> "0..*" Steen : stopt in wolf

note "De relaties veranderen\ntijdens het verhaal!" as N1

@enduml
```

### Observaties bij het domeinmodel

- **Attributen** beschrijven de staat van karakters (Wolf heeft `honger: boolean`)
- **Methodes** beschrijven wat karakters kunnen doen (`eetOp(slachtoffer)`)
- **Relaties** zijn dynamisch: ze ontstaan en verdwijnen tijdens het verhaal
- De **note** waarschuwt dat dit een snapshot is - het verhaal verandert de relaties

Dit domeinmodel is onze "broncode" van de sprookjeswereld. De sequentiediagrammen hieronder tonen hoe deze objecten met elkaar interacteren in de tijd.

---

## Waarom opsplitsen?

Een groot sequentiediagram met alle interacties wordt snel onoverzichtelijk. Net als bij code geldt het **Single Responsibility Principle**: elk diagram beschrijft één fase of scenario. Dit maakt de diagrammen:

- **Leesbaar** - Elk diagram past op één scherm
- **Onderhoudbaar** - Wijzigingen raken alleen het relevante deel
- **Testbaar** - Elk deel kan apart geverifieerd worden

---

## Overzichtsdiagram: De drie fasen

Eerst een activity diagram dat de hoofdlijnen van het verhaal toont:

```kroki imgType="plantuml" imgTitle="Roodkapje: Overzicht van de drie fasen" lang="nl" customDescription="Activity diagram met drie fasen: A) Reis naar oma met ontmoeting wolf, B) Bij oma's huis waar de wolf Roodkapje opeet, C) De jager bevrijdt Roodkapje. Het diagram toont de volgorde van deze fasen."
@startuml
!theme plain
title Roodkapje - Overzicht

start
:Moeder geeft opdracht;
note right: Breng mandje naar oma

partition "A: Reis naar oma" {
  :Roodkapje vertrekt;
  :Ontmoeting met wolf;
  :Wolf rent vooruit;
}

partition "B: Bij oma's huis" {
  :Wolf eet oma op;
  :Wolf vermomt zich;
  :Roodkapje arriveert;
  :Wolf eet Roodkapje op;
}

partition "C: De redding" {
  :Jager arriveert;
  :Jager bevrijdt oma en Roodkapje;
  :Wolf wordt gestraft;
}

stop
@enduml
```

We gebruiken hier een **activity diagram** voor het overzicht omdat:

- Het de **volgorde** van fasen toont (flow)
- Partities de **drie delen** duidelijk scheiden
- Het abstracter is dan een sequence diagram (geen objecten/methodes)

---

## Fase A: De reis naar oma

Roodkapje krijgt de opdracht om een mandje naar oma te brengen en ontmoet onderweg de wolf.

```kroki imgType="plantuml" imgTitle="Fase A: Reis naar oma" lang="nl" customDescription="Sequentiediagram van fase A: Moeder geeft Roodkapje een mandje met opdracht naar oma te gaan. Onderweg ontmoet Roodkapje de Wolf die vraagt waar ze heen gaat. Roodkapje vertelt over oma's huis. De Wolf besluit een kortere weg te nemen."
@startuml
title Fase A: De reis naar oma

autonumber

actor "Moeder" as Moeder
participant "Roodkapje" as RK
participant "Wolf" as Wolf
participant "Oma" as Oma

== Vertrek ==

Moeder -> RK: geefMandje(koekjes, wijn)
Moeder -> RK: "Breng dit naar oma,\nen blijf op het pad!"
RK -> RK: vertrek()

== Ontmoeting in het bos ==

Wolf -> RK: "Goedendag, waar ga je heen?"
RK --> Wolf: "Naar oma's huis\nin het bos"
Wolf -> Wolf: bedenktPlan()
note right: Wolf besluit\nkortere weg te nemen

Wolf -> Wolf: neem(kortsteRoute, omasHuis)

@enduml
```

### Toelichting bij fase A

In dit diagram zien we de setup van het verhaal:

- **Moeder** initialiseert het verhaal door Roodkapje een opdracht te geven
- **Roodkapje** ontvangt het mandje (parameter: koekjes en wijn)
- **Wolf** verzamelt informatie en maakt een plan
- De `neem(kortsteRoute, omasHuis)` is een self-call: de Wolf besluit zelf

---

## Fase B: Bij oma's huis

De wolf arriveert als eerste, eet oma op, en vermomt zich. Dan arriveert Roodkapje.

```kroki imgType="plantuml" imgTitle="Fase B: Bij oma's huis" lang="nl" customDescription="Sequentiediagram van fase B: De Wolf arriveert bij oma's huis en klopt aan. Oma doet open, de Wolf eet haar op. De Wolf vermomt zich als oma en gaat in bed liggen. Roodkapje arriveert en klopt aan. Na de bekende dialoog over grote ogen, oren en mond, eet de Wolf ook Roodkapje op."
@startuml
title Fase B: Bij oma's huis

autonumber

participant "Wolf" as Wolf
participant "Oma" as Oma
participant "Roodkapje" as RK

== Wolf arriveert eerst ==

Wolf -> Oma: klop()
Oma --> Wolf: "Wie is daar?"
Wolf -> Oma: "Roodkapje met koekjes"
Oma -> Oma: openDeur()
Wolf -> Oma: eetOp()
destroy Oma
note right: Oma is opgegeten

Wolf -> Wolf: vermom(alsOma)
Wolf -> Wolf: gaInBed()

== Roodkapje arriveert ==

RK -> Wolf: klop()
Wolf --> RK: "Kom binnen, lieverd"
RK -> Wolf: "Oma, wat heb je\ngrote ogen!"
Wolf --> RK: "Om je beter\nte zien"
RK -> Wolf: "Oma, wat heb je\ngrote oren!"
Wolf --> RK: "Om je beter\nte horen"
RK -> Wolf: "Oma, wat heb je\neen grote mond!"
Wolf --> RK: "Om je beter\nop te eten!"

Wolf -> RK: eetOp()
destroy RK
note right: Roodkapje is opgegeten

@enduml
```

### Toelichting bij fase B

Dit diagram toont de climax van het verhaal:

- **destroy** keyword toont dat een actor "verdwijnt" (opgegeten)
- De dialoog met de grote ogen/oren/mond is een herhalend patroon
- **Self-calls** (`vermom`, `gaInBed`) tonen interne acties van de Wolf

---

## Fase C: De redding

De jager hoort gesnurk, onderzoekt de situatie en bevrijdt Roodkapje en oma.

```kroki imgType="plantuml" imgTitle="Fase C: De redding" lang="nl" customDescription="Sequentiediagram van fase C: De Jager hoort hard gesnurk en besluit te onderzoeken. Hij gaat oma's huis binnen, ziet de Wolf met dikke buik. De Jager knipt de buik open en bevrijdt Roodkapje en Oma. Roodkapje haalt stenen die in de buik worden gestopt. De Wolf wordt gestraft."
@startuml
title Fase C: De redding

autonumber

actor "Jager" as Jager
participant "Wolf" as Wolf
participant "Roodkapje" as RK
participant "Oma" as Oma

== Ontdekking ==

Jager -> Jager: hoort(hardGesnurk)
Jager -> Jager: besluit(onderzoeken)
Jager -> Wolf: gaHuisBinnen()

note over Jager, Wolf: Jager ziet Wolf\nmet dikke buik

== Bevrijding ==

Jager -> Wolf: knipBuikOpen()

create RK
Wolf --> RK: <<bevrijd>>
create Oma
Wolf --> Oma: <<bevrijd>>

RK --> Jager: "Dank u wel!"
Oma --> Jager: "Dank u wel!"

== Straf ==

RK -> RK: haal(stenen)
RK -> Wolf: vulBuik(stenen)
Jager -> Wolf: naai(buikDicht)
Wolf -> Wolf: probeertTeVluchten()
Wolf -> Wolf: valt(omEnSterft)
destroy Wolf

@enduml
```

### Toelichting bij fase C

Dit diagram toont de ontknoping:

- **create** keyword toont dat Roodkapje en Oma "terugkomen"
- **`<<bevrijd>>`** is een stereotype dat het type interactie aangeeft
- De Wolf krijgt zijn straf via een reeks acties

---

## Alternatief: Overzicht als sequence diagram

Als alternatief voor het activity diagram kunnen we ook een high-level sequence diagram maken. Dit is abstracter en toont alleen de hoofdinteracties:

```kroki imgType="plantuml" imgTitle="Roodkapje: Overzicht als sequence diagram" lang="nl" customDescription="High-level sequentiediagram dat de drie fasen toont: In fase A ontmoet Roodkapje de Wolf in het bos. In fase B eet de Wolf eerst Oma en dan Roodkapje op. In fase C bevrijdt de Jager beiden en straft de Wolf."
@startuml
title Roodkapje - Hoofdlijnen

participant "Roodkapje" as RK
participant "Wolf" as Wolf
participant "Oma" as Oma
actor "Jager" as Jager

== A: Reis naar oma ==
RK -> Wolf: ontmoeting in bos
Wolf --> RK: vraagt naar bestemming

== B: Bij oma's huis ==
Wolf -> Oma: eet op
Wolf -> RK: eet op

== C: De redding ==
Jager -> Wolf: opent buik
Jager --> RK: bevrijdt
Jager --> Oma: bevrijdt
RK -> Wolf: straft met stenen

@enduml
```

### Wanneer welk diagram?

| Diagram | Gebruik |
|---------|---------|
| **Activity diagram** | Toont **flow** en **beslissingen**, goed voor processtappen |
| **Sequence diagram** | Toont **interacties** tussen objecten/actoren in tijd |

Voor het overzicht werkt het activity diagram beter omdat:
- Het de fasen als blokken toont (partities)
- Het geen objecten nodig heeft op dit abstractieniveau
- De volgorde visueel duidelijker is

---

## Les: Vermijd het "God Diagram"

Net als bij software design willen we geen "God Object" dat alles doet. Een diagram met 50+ interacties is:

1. **Onleesbaar** - Te veel om in één keer te bevatten
2. **Ononderhoudbaar** - Elke wijziging raakt het hele diagram
3. **Onbruikbaar** - Voor screenreaders is zo'n diagram niet toegankelijk te maken

Door het verhaal op te splitsen in **A**, **B** en **C** krijgen we:
- Elk diagram beschrijft één fase
- Makkelijk te begrijpen en uit te leggen
- Beter te vertalen naar toegankelijke beschrijvingen

Dit principe geldt ook voor softwarediagrammen: splits complexe flows op in deelscenario's!

---

## En ze ontwierpen en documenteerden nog lang en gelukkig

We hopen dat dit voorbeeld je laat inzien dat zowel **natuurlijke taal** als **formele diagrammen** hun plaats hebben in softwareontwikkeling. Er is geen "beste" notatie - het hangt af van:

### De fase in de Software Development Life Cycle (SDLC)

| Fase | Voorkeur | Waarom |
|------|----------|--------|
| **Requirements** | Natuurlijke taal, User Stories | Communicatie met stakeholders |
| **Analyse** | Domain Stories, Use Cases | Begrip van het probleemdomein |
| **Ontwerp** | UML-diagrammen, C4 | Precieze specificatie voor developers |
| **Implementatie** | Code (de ultieme formele taal) | Uitvoerbaar door machines |
| **Documentatie** | Mix van beide | Afhankelijk van de doelgroep |

### De doelgroep

- **Opdrachtgevers en eindgebruikers** - Natuurlijke taal, eventueel met Domain Stories
- **Business Analysts** - Use Cases, User Stories, acceptatiecriteria
- **Developers** - UML-diagrammen, API-specificaties, code
- **Compilers en runtimes** - Alleen formele code, geen ambiguïteit toegestaan

### Verdere verdieping

Dit inzicht is niet nieuw. Enkele klassieke bronnen:

- Patton (2014) beschreef hoe je User Stories gebruikt om verhalen te vertellen in Agile
- Booch, Rumbaugh & Jacobson (1999) - de "Three Amigos" - ontwikkelden UML als standaardtaal voor software design
- Reeves (1992) schreef het baanbrekende artikel dat stelt dat code het échte ontwerp is, niet de diagrammen
- Van der Wal (z.d.) geeft praktische uitleg over domeinmodelleren

Zie de [Bronnen](#bronnen) sectie onderaan voor volledige referenties.

### De les van Reeves

Het artikel van Reeves (1992) is bijzonder relevant: hij betoogt dat high-level programmeertalen slechts een stap zijn in een spectrum. De "echte" code is machinetaal - alles daarboven is een vorm van ontwerp. Dit betekent:

1. **Diagrammen** zijn ontwerp op hoog abstractieniveau
2. **High-level code** (Java, Python, TypeScript) is ontwerp op lager niveau
3. **Machinetaal** is de uiteindelijke implementatie

Daarom is het essentieel om te leren hoe je high-level programmeertalen zo schrijft dat ze **aansluiten bij het ontwerp**. De code moet het verhaal vertellen - net zoals dit sprookje van Roodkapje.

### Tot slot

Net als Roodkapje uiteindelijk veilig thuiskwam, hopen wij dat jij na het lezen van dit voorbeeld:

- Begrijpt wanneer je natuurlijke taal gebruikt en wanneer formele diagrammen
- Weet hoe je grote verhalen opsplitst in beheersbare delen
- Inziet dat code óók een vorm van storytelling is
- Klaar bent om je eigen softwareverhalen te vertellen - toegankelijk voor iedereen

---

## En toen...

*"Ze leefden nog lang en gelukkig"* is een fijn einde, maar geeft weinig aangrijpingspunten voor een goed verhaal. Wat gebeurt er ná "en ze leefden nog lang en gelukkig"? In software termen: wat gebeurt er ná de eerste release?

### Specificeren en valideren: het verhaal gaat door

Het doel van de meeste softwareproducten is de gebruiker gelukkig te maken. Maar hoe weet je of je gebruiker écht gelukkig is? Hier komen **specificatie** en **validatie** om de hoek kijken:

| Activiteit | Vraag | Methode |
|------------|-------|---------|
| **Specificeren** | "Wat willen we bouwen?" | User Stories, Use Cases, Acceptance Criteria |
| **Valideren** | "Hebben we het goede gebouwd?" | User testing, A/B testing, feedback loops |
| **Verifiëren** | "Hebben we het goed gebouwd?" | Unit tests, integration tests, code reviews |

Net als bij Roodkapje: het verhaal eindigt niet bij "en ze leefden nog lang en gelukkig". Oma heeft misschien PTSS, de Wolf heeft familie die wraak wil, en Roodkapje overweegt een carrière als jager. Het échte werk begint pas ná de eerste versie.

### De technische term: Enshittification

Helaas blijkt "lang en gelukkig" niet altijd de realiteit. Doctorow (2023) introduceerde de (sociaal-)technische term **enshittification** om te beschrijven hoe veel grote social media platforms eerst waarde creëren voor gebruikers, dan voor adverteerders, en uiteindelijk alleen voor zichzelf.

Interessant genoeg toont economisch onderzoek (Dubner, 2024) dat veel gebruikers zouden *betalen* om platforms als Facebook te laten verdwijnen. Het "lang en gelukkig" is een illusie geworden.

### Wat betekent dit voor softwareontwikkeling?

Als je software ontwerpt, vraag jezelf af:

1. **Voor wie optimaliseer je?** De gebruiker, het bedrijf, of de aandeelhouders?
2. **Wat is de lange-termijn visie?** Blijft de software waarde leveren, of wordt het een extractie-machine?
3. **Hoe meet je "gelukkig"?** Engagement metrics zijn niet hetzelfde als gebruikerstevredenheid

Dit raakt direct aan de specificatie-vraag: als je User Stories schrijft vanuit het perspectief van de gebruiker ("Als gebruiker wil ik..."), maar de acceptance criteria optimaliseren voor adverteerders, dan heb je een fundamenteel conflict.

### Het echte einde

Misschien is het eerlijkste einde van ons Roodkapje-verhaal:

*"En ze ontwierpen en documenteerden voort, steeds opnieuw validerend of hun gebruikers nog steeds gelukkig waren - wetende dat 'lang en gelukkig' geen eindtoestand is, maar een continu proces van luisteren, aanpassen en verbeteren."*

Of, in code:

```java
while (users.areHappy()) {
    listen(users.getFeedback());
    adapt(product);
    validate(users.getHappiness());
}
// Als je hier komt, heb je iets fundamenteel mis gedaan
```

---

## Over dit artikel

Dit artikel is geschreven door Bart van der Wal met Claude (Anthropic) als co-auteur. Claude hielp bij het structureren van de inhoud, het genereren van de PlantUML-diagrammen, en het formuleren van de filosofische beschouwingen.

:::info Feedback welkom
Hoewel ik (Bart) eindverantwoordelijk ben voor de inhoud, is feedback over eventuele fouten of onduidelijkheden zeer welkom. Meld issues via [GitHub](https://github.com/AIM-ENE/remark-kroki-a11y/issues) of neem contact op.
:::

---

## Bronnen

Booch, G., Rumbaugh, J., & Jacobson, I. (1999). *The Unified Modeling Language user guide*. Addison-Wesley.

Doctorow, C. (2023, 21 januari). *Tiktok's enshittification*. Pluralistic. https://pluralistic.net/2023/01/21/potemkin-ai/

Dubner, S. J. (Host). (2024, 18 januari). *Are you caught in a social media trap?* [Podcast aflevering]. In *Freakonomics Radio*. Freakonomics, LLC. https://freakonomics.com/podcast/are-you-caught-in-a-social-media-trap/

Hoare, C. A. R. (1980). The emperor's old clothes. *Communications of the ACM, 24*(2), 75-83. https://doi.org/10.1145/358549.358561

Patton, J. (2014). *User story mapping: Discover the whole story, build the right product*. O'Reilly Media.

Reeves, J. W. (1992). What is software design? *C++ Journal, 2*(2). https://www.developerdotstar.com/mag/articles/reeves_design.html

Van der Wal, B. (z.d.). *Domeinmodellen*. Minor DevOps. https://minordevops.nl/week-2/domein-model.html

---

## Bijlagen

### Bijlage A: Het "God Diagram" (anti-pattern)

:::danger Anti-pattern
Het onderstaande diagram is een **anti-pattern**. We tonen het hier expliciet om te demonstreren waarom je dit NIET moet doen. Dit is het diagram-equivalent van de tweede situatie die Hoare (1980) beschrijft:

> "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies."

Een "God Diagram" maken is kiezen voor de tweede optie: zo complex dat je eventuele fouten niet meer ziet. Het belandt op de kast, en lezers nemen aan 'Het zal wel kloppen', of als ze wel een fout vinden, denken ze eerder 'dan zal het hele diagram wel niet kloppen', in plaats van de fout te fixen. Voorgaande twee argumenten zijn natuurlijk voorbeelden van (typical) human fallacy. Daar zouden we aan kunnen werken; maar mijn voorstel is om meteen de 'god diagram' neiging als fallacy aan te merken, en dit niet meer te doen, en zo deze secundaire fallacy te proberen te voorkomen.

:::

```kroki imgType="plantuml" imgTitle="ANTI-PATTERN: God Diagram met alle fasen" lang="nl" customDescription="Dit is een anti-pattern. Een gecombineerd sequentiediagram met ALLE interacties uit fase A, B en C. Het diagram is bewust te groot en onoverzichtelijk om te laten zien waarom je dit niet moet doen. Het bevat meer dan 40 interacties en is vrijwel onleesbaar."
@startuml
title ANTI-PATTERN: Roodkapje - God Diagram\n(Doe dit NIET!)

autonumber

actor "Moeder" as Moeder
participant "Roodkapje" as RK
participant "Wolf" as Wolf
participant "Oma" as Oma
actor "Jager" as Jager

== FASE A: Vertrek ==

Moeder -> RK: geefMandje(koekjes, wijn)
Moeder -> RK: "Breng dit naar oma,\nen blijf op het pad!"
RK -> RK: vertrek()

== FASE A: Ontmoeting in het bos ==

Wolf -> RK: "Goedendag, waar ga je heen?"
RK --> Wolf: "Naar oma's huis\nin het bos"
Wolf -> Wolf: bedenktPlan()
note right: Wolf besluit\nkortere weg te nemen
Wolf -> Wolf: neem(kortsteRoute, omasHuis)

== FASE B: Wolf arriveert eerst ==

Wolf -> Oma: klop()
Oma --> Wolf: "Wie is daar?"
Wolf -> Oma: "Roodkapje met koekjes"
Oma -> Oma: openDeur()
Wolf -> Oma: eetOp()
destroy Oma
note right: Oma is opgegeten

Wolf -> Wolf: vermom(alsOma)
Wolf -> Wolf: gaInBed()

== FASE B: Roodkapje arriveert ==

RK -> Wolf: klop()
Wolf --> RK: "Kom binnen, lieverd"
RK -> Wolf: "Oma, wat heb je\ngrote ogen!"
Wolf --> RK: "Om je beter\nte zien"
RK -> Wolf: "Oma, wat heb je\ngrote oren!"
Wolf --> RK: "Om je beter\nte horen"
RK -> Wolf: "Oma, wat heb je\neen grote mond!"
Wolf --> RK: "Om je beter\nop te eten!"

Wolf -> RK: eetOp()
destroy RK
note right: Roodkapje is opgegeten

== FASE C: Ontdekking ==

Jager -> Jager: hoort(hardGesnurk)
Jager -> Jager: besluit(onderzoeken)
Jager -> Wolf: gaHuisBinnen()

note over Jager, Wolf: Jager ziet Wolf\nmet dikke buik

== FASE C: Bevrijding ==

Jager -> Wolf: knipBuikOpen()

create RK
Wolf --> RK: <<bevrijd>>
create Oma
Wolf --> Oma: <<bevrijd>>

RK --> Jager: "Dank u wel!"
Oma --> Jager: "Dank u wel!"

== FASE C: Straf ==

RK -> RK: haal(stenen)
RK -> Wolf: vulBuik(stenen)
Jager -> Wolf: naai(buikDicht)
Wolf -> Wolf: probeertTeVluchten()
Wolf -> Wolf: valt(omEnSterft)
destroy Wolf

@enduml
```

### Waarom is dit een anti-pattern?

1. **Onleesbaar** - Zelfs met een relatief eenvoudig verhaal als Roodkapje is het diagram al overweldigend
2. **Geen focus** - Je kunt niet zien waar het over gaat zonder het hele diagram te bestuderen
3. **Moeilijk te onderhouden** - Elke wijziging raakt potentieel het hele diagram
4. **Niet toegankelijk** - Een screenreader kan hier geen bruikbare beschrijving van genereren
5. **Analysis paralysis** - Je verdrinkt in de complexiteit

### De oplossing: decompositie

De manier om een groot probleem op te lossen (of een uitgebreid verhaal te vertellen) is door het op te splitsen in deelproblemen en elk deelprobleem apart op te lossen. Niet door in één keer een grote oplossing te maken, want dan verdrink je in complexiteit.

De grootste uitdaging is vaak wel de gehele oplossing uiteindelijk te **valideren** als compositie van je deeloplossingen. Je hebt het extra probleem dat je de deeloplossingen ook goed op elkaar moet laten aansluiten. Je moet een **integratietest** hebben of zelfs een **end-to-end test**, naast unit tests voor je onderdelen.

### Software Engineering als Design Science

Software Engineering is een *Design Science* (DS). Dit anti-pattern illustreert het DS-equivalent van het feit dat een goed/nuttig geheel (systeem) meer is dan enkel de som van zijn delen (elementen). Het splitsen in delen is noodzakelijk, maar de kunst is om die delen zo te ontwerpen dat ze samen een coherent geheel vormen.

Of, zoals we in de inleiding stelden: net als bij C4-diagrammen gebruik je verschillende zoomniveaus. Je hebt een overzicht nodig én gedetailleerde views - maar niet alles in één diagram.
