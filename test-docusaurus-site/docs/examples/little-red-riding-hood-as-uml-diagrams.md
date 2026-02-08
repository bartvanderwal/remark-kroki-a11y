---
sidebar_label: Red Riding Hood as UML diagrams
---

# Red Riding Hood as UML diagrams

## A gentle introduction to UML diagrams*

<img src={require('./roodkapje-in-het-bos-dalle.png').default} alt="Little Red Riding Hood in the forest" width="600" />

Little Red Riding Hood in the forest (image generated with ChatGPT/DALL-E, OpenAI, 2025).*

---

This example demonstrates how to translate a natural language story (the fairy tale of Little Red Riding Hood) into formal diagrams; specifically, UML diagrams. In this way, it provides a good introduction to (some) UML diagrams for non-technical people to get an understanding, or for beginning technical people (software engineers).

We split the story into three parts to avoid a "God Diagram". A God diagram is an anti-pattern, just like a ['God object'](https://en.wikipedia.org/wiki/God_object). Splitting is a best practice to prevent 'cognitive load'. To still provide an overview, we create a separate diagram that shows the relationships between parts. This is similar to how C4 also uses different zoom levels.

This article first introduces the domain model: the "world" of the fairy tale with all characters and their relationships. Then we work out the story in three phases, each with a sequence diagram showing interactions between characters. Finally, the appendices contain a more detailed domain model (Fowler-style) and the "God Diagram" as an anti-pattern example.

---

## Once upon a time...

Before we tell the story in sequence diagrams, we first define the "world" of the fairy tale in a class diagram. This is a simple *domain model* in the style of Larman (2004): only attributes, without data types or methods. This keeps the model readable and focuses on *what* exists in the fairy tale world, not yet *how* these concepts behave.

```kroki imgType="plantuml" imgTitle="Little Red Riding Hood: Domain Model (Larman-style)" lang="en" customDescription="Simple domain model with all characters from the Little Red Riding Hood story. Little Red has a name and a red hood. Mother has a name and gives tasks. Wolf has hunger and a disguise. Grandmother is sick. Huntsman has scissors. Basket contains cookies and wine. House is in the forest. Stone has a weight."
@startuml
!theme plain
title Once upon a time... the domain model of Little Red Riding Hood

class LittleRedRidingHood {
  name
  hasRedHood
}

class Mother {
  name
}

class Basket {
  cookies
  wine
}

class Wolf {
  hunger
  disguise
}

class Grandmother {
  name
  isSick
}

class Huntsman {
  hasScissors
}

class House {
  location
  hasBed
}

class Stone {
  weight
}

Mother --> LittleRedRidingHood : is mother of
LittleRedRidingHood --> Basket : carries
Grandmother --> House : lives in
Wolf --> Grandmother : visits / eats
Wolf --> LittleRedRidingHood : meets / eats
Huntsman --> Wolf : opens belly of
Huntsman --> "0..*" Stone : puts in wolf

note "Relationships change\nduring the story!" as N1

@enduml
```

### Glossary of entities

The table below describes each entity from the domain model:

| Entity | Description |
|--------|-------------|
| **LittleRedRidingHood** | The main character, a young girl with a red hood |
| **Mother** | Little Red's mother, gives the task |
| **Basket** | Container with treats for grandmother |
| **Wolf** | The antagonist, hungry and cunning |
| **Grandmother** | Little Red's grandmother, sick |
| **Huntsman** | The hero who rescues |
| **House** | Grandmother's house |
| **Stone** | Punishment for the wolf |

:::note Domain modeling: abstraction and inheritance
In this beginner-friendly model, we show all entities at the same level of abstraction. In a more refined model, we would notice that **LittleRedRidingHood** and **Grandmother** are actually both instances of a shared superclass **Person**. Similarly, **Wolf** and possibly **Huntsman** are living beings with certain properties. This illustrates an important lesson in domain modeling: you can group entities under more abstract concepts.

For this story, we intentionally chose a *flat* structure because the narrative is more about **who interacts with whom** rather than their taxonomic classification. The detailed Fowler-style version in [Appendix A](#appendix-a-detailed-domain-model-fowler-style) goes deeper into this aspect.

**Note about concrete examples:** In a production environment, the Glossary would include concrete examples, such as `LittleRedRidingHood { name: "Little Red", hasRedHood: true }` or `Basket { cookies: 12, wine: 1 }`. This helps developers and domain experts understand the data format and possible values. For this educational example, we've omitted these details to focus on the relationships between entities.
:::

---

## Why split up?

A large sequence diagram with all interactions quickly becomes confusing. Just like with code, the **Single Responsibility Principle** applies: each diagram describes one phase or scenario. This makes the diagrams:

- **Readable** - Each diagram fits on one screen
- **Maintainable** - Changes only affect the relevant part
- **Testable** - Each part can be verified separately

---

## Overview Diagram: The Three Phases

First, an activity diagram showing the main storyline:

```kroki imgType="plantuml" imgTitle="Little Red Riding Hood: Overview of the three phases" lang="en" customDescription="Activity diagram with three phases: A) Journey to grandmother with wolf encounter, B) At grandmother's house where the wolf eats Little Red, C) The huntsman rescues Little Red. The diagram shows the sequence of these phases."
@startuml
!theme plain
title Little Red Riding Hood - Overview

start
:Mother gives task;
note right: Bring basket to grandmother

partition "A: Journey to grandmother" {
  :Little Red departs;
  :Encounter with wolf;
  :Wolf runs ahead;
}

partition "B: At grandmother's house" {
  :Wolf eats grandmother;
  :Wolf disguises himself;
  :Little Red arrives;
  :Wolf eats Little Red;
}

partition "C: The rescue" {
  :Huntsman arrives;
  :Huntsman rescues grandmother and Little Red;
  :Wolf is punished;
}

stop
@enduml
```

We use an **activity diagram** for the overview because:

- It shows the **sequence** of phases (flow)
- Partitions clearly separate the **three parts**
- It's more abstract than a sequence diagram (no objects/methods)

---

## Phase A: The journey to grandmother

Little Red Riding Hood receives the task to bring a basket to grandmother and meets the wolf on the way.

In this first phase we use **strings as messages** - the simplest way to show interactions between characters. This is how Alan Kay originally envisioned Object-Oriented Programming: objects that send messages to each other, without knowing the internal implementation of the receiver.

```kroki imgType="plantuml" imgTitle="Phase A: Journey to grandmother" lang="en" customDescription="Sequence diagram of phase A: Mother gives Little Red a basket with the task to go to grandmother. On the way, Little Red meets the Wolf who asks where she is going. Little Red tells about grandmother's house. The Wolf decides to take a shorter path."
@startuml
title Phase A: The journey to grandmother

autonumber

actor "Mother" as Mother
participant "Little Red" as LR
participant "Wolf" as Wolf
participant "Grandmother" as Grandma

== Departure ==

Mother -> LR: "Here is a basket with cookies and wine"
Mother -> LR: "Bring this to grandmother,\nand stay on the path!"
LR -> LR: "I'm leaving"

== Encounter in the forest ==

Wolf -> LR: "Good day, where are you going?"
LR --> Wolf: "To grandmother's house\nin the forest"
Wolf -> Wolf: "Hmm, I'll take the shortcut..."
note right: Wolf decides to\ntake shorter path

@enduml
```

### Explanation of phase A

In this diagram we see the setup of the story:

- **Mother** initiates the story by giving Little Red a task
- **Little Red** receives a basket (the message describes the content)
- **Wolf** gathers information and makes a plan
- The self-message ("I'll take the shortcut...") shows the Wolf's internal decision

### Why strings as messages?

This notation with strings matches Alan Kay's original vision of **message passing**: objects communicate through messages, similar to how people talk to each other. This is fundamentally different from *method calls* (which we'll see in Phase B).

| Concept | Message passing | Method calls |
|---------|-----------------|--------------|
| **Coupling** | Loose: sender doesn't know implementation | Tight: sender knows the interface |
| **Analogy** | Event-driven architecture | RPC (Remote Procedure Call) |
| **Flexibility** | Receiver can interpret message | Contract is fixed |

In software we see message passing in event-driven systems (like message queues, publish-subscribe) and method calls in traditional OO (Java, C#, TypeScript).

---

## Phase B: At grandmother's house

The wolf arrives first, eats grandmother, and disguises himself. Then Little Red arrives.

In this phase we switch from strings to **method names**. This is a step towards the formal UML notation used in software design. Method names are more specific: `knock()` is clearer than "knocks on the door".

```kroki imgType="plantuml" imgTitle="Phase B: At grandmother's house" lang="en" customDescription="Sequence diagram of phase B: The Wolf arrives at grandmother's house and knocks. Grandmother opens, the Wolf eats her. The Wolf disguises himself as grandmother and gets into bed. Little Red arrives and knocks. After the famous dialogue about big eyes, ears and mouth, the Wolf also eats Little Red."
@startuml
title Phase B: At grandmother's house

autonumber

participant "Wolf" as Wolf
participant "Grandmother" as Grandma
participant "Little Red" as LR

== Wolf arrives first ==

Wolf -> Grandma: knock()
Grandma --> Wolf: askWhoIsThere()
Wolf -> Grandma: answer("Little Red with cookies")
Grandma -> Grandma: openDoor()
Wolf -> Grandma: eatUp()
destroy Grandma
note right: Grandmother is eaten

Wolf -> Wolf: disguise(asGrandmother)
Wolf -> Wolf: getIntoBed()

== Little Red arrives ==

LR -> Wolf: knock()
Wolf --> LR: answer("Come in, dear")
LR -> Wolf: askAbout(eyes)
Wolf --> LR: answer("All the better to see you with")
LR -> Wolf: askAbout(ears)
Wolf --> LR: answer("All the better to hear you with")
LR -> Wolf: askAbout(mouth)
Wolf --> LR: answer("All the better to eat you with!")

Wolf -> LR: eatUp()
destroy LR
note right: Little Red is eaten

@enduml
```

### Explanation of phase B

This diagram shows the climax of the story:

- **destroy** keyword shows that an actor "disappears" (eaten)
- The dialogue with `askAbout(eyes/ears/mouth)` shows a repeating pattern
- **Self-calls** (`disguise`, `getIntoBed`) show internal actions of the Wolf

### From messages to methods

Note the transition from Phase A to Phase B:

| Phase A (strings) | Phase B (methods) |
|-------------------|-------------------|
| "Good day, where are you going?" | `askWhoIsThere()` |
| "To grandmother's house..." | `answer("...")` |

This reflects how we work in software design: we start with informal descriptions (user stories, scenarios) and gradually formalize them into interfaces and method signatures.

---

## Phase C: The rescue

The huntsman hears snoring, investigates the situation and rescues Little Red and grandmother.

In this phase we add even more detail: a **StoneFactory** that creates stones in a loop. This introduces two advanced UML concepts: the *Factory* design pattern and *loop* constructs in sequence diagrams.

```kroki imgType="plantuml" imgTitle="Phase C: The rescue" lang="en" customDescription="Sequence diagram of phase C: The Huntsman hears loud snoring and decides to investigate. He enters grandmother's house, sees the Wolf with a fat belly. The Huntsman cuts the belly open and rescues Little Red and Grandmother. A StoneFactory creates multiple stones that are put in the wolf's belly. The Wolf is punished."
@startuml
title Phase C: The rescue

autonumber

actor "Huntsman" as Huntsman
participant "Wolf" as Wolf
participant "Little Red" as LR
participant "Grandmother" as Grandma
participant "StoneFactory" as Factory

== Discovery ==

Huntsman -> Huntsman: hears(loudSnoring)
Huntsman -> Huntsman: decides(investigate)
Huntsman -> Wolf: enterHouse()

note over Huntsman, Wolf: Huntsman sees Wolf\nwith fat belly

== Rescue ==

Huntsman -> Wolf: cutBellyOpen()

create LR
Wolf --> LR: <<rescued>>
create Grandma
Wolf --> Grandma: <<rescued>>

LR --> Huntsman: sayThankYou()
Grandma --> Huntsman: sayThankYou()

== Punishment ==

loop for each stone (7x)
    LR -> Factory: createStone()
    Factory --> LR: stone
    LR -> Wolf: putInBelly(stone)
end

Huntsman -> Wolf: sewBellyClosed()
Wolf -> Wolf: tryToFlee()
Wolf -> Wolf: fallDownAndDie()
destroy Wolf

@enduml
```

### Explanation of phase C

This diagram shows the resolution:

- **create** keyword shows that Little Red and Grandmother "return"
- **`<<rescued>>`** is a stereotype indicating the type of interaction
- The **StoneFactory** is a *Factory* (design pattern) that creates objects
- The **loop** construct shows that an action is repeated multiple times

### Why a StoneFactory?

In software design we use *Factories* to create objects. The Factory pattern has several advantages:

- **Encapsulation**: the creation logic is in one place
- **Flexibility**: you can easily create different types of stones
- **Testability**: the factory can be mocked in tests

This is of course exaggerated for a fairy tale, but illustrates how you gradually add technical concepts to a model.

Note also that we show all three phases at different levels of detail:

- Phase A: strings (informal)
- Phase B: method names (semi-formal)
- Phase C: methods + loops + Factory (formal)

In real software development you would choose *one* level of detail for all parts. But for this tutorial we deliberately show the progression from informal to formal. It's a didactic choice to show how models can evolve.

---

<details>
<summary>Alternative: Overview as sequence diagram</summary>

As an alternative to the activity diagram, we can also create a high-level sequence diagram. This is more abstract and shows only the main interactions:

```kroki imgType="plantuml" imgTitle="Little Red Riding Hood: Overview as sequence diagram" lang="en" customDescription="High-level sequence diagram showing the three phases: In phase A Little Red meets the Wolf in the forest. In phase B the Wolf eats first Grandmother then Little Red. In phase C the Huntsman rescues both and punishes the Wolf."
@startuml
title Little Red Riding Hood - Main storyline

participant "Little Red" as LR
participant "Wolf" as Wolf
participant "Grandmother" as Grandma
actor "Huntsman" as Huntsman

== A: Journey to grandmother ==
LR -> Wolf: encounter in forest
Wolf --> LR: asks about destination

== B: At grandmother's house ==
Wolf -> Grandma: eats
Wolf -> LR: eats

== C: The rescue ==
Huntsman -> Wolf: opens belly
Huntsman --> LR: rescues
Huntsman --> Grandma: rescues
LR -> Wolf: punishes with stones

@enduml
```

#### When to use which diagram?

| Diagram | Use case |
|---------|----------|
| **Activity diagram** | Shows **flow** and **decisions**, good for process steps |
| **Sequence diagram** | Shows **interactions** between objects/actors over time |

For the overview, the activity diagram works better because:

- It shows phases as blocks (partitions)
- It doesn't need objects at this abstraction level
- The sequence is visually clearer

</details>

---

## Lesson: Avoid the "God Diagram"

Just like in software design we don't want a "God Object" that does everything. A diagram with 50+ interactions is:

1. **Unreadable** - Too much to grasp at once
2. **Unmaintainable** - Every change affects the entire diagram
3. **Unusable** - For screen readers such a diagram cannot be made accessible

By splitting the story into **A**, **B** and **C** we get:

- Each diagram describes one phase
- Easy to understand and explain
- Better to translate into accessible descriptions

This principle also applies to software diagrams: split complex flows into sub-scenarios!

---

## And they designed and documented happily ever after

We hope this example shows you that both **natural language** and **formal diagrams** have their place in software development. There is no "best" notation - it depends on:

### The phase in the Software Development Life Cycle (SDLC)

| Phase | Preference | Why |
|-------|------------|-----|
| **Requirements** | Natural language, User Stories | Communication with stakeholders |
| **Analysis** | Domain Stories, Use Cases | Understanding the problem domain |
| **Design** | UML diagrams, C4 | Precise specification for developers |
| **Implementation** | Code (the ultimate formal language) | Executable by machines |
| **Documentation** | Mix of both | Depends on the audience |

### The audience

- **Clients and end users** - Natural language, possibly with Domain Stories
- **Business Analysts** - Use Cases, User Stories, acceptance criteria
- **Developers** - UML diagrams, API specifications, code
- **Compilers and runtimes** - Only formal code, no ambiguity allowed

### Further reading

This insight is not new. Some classic sources:

- Patton (2014) described how to use User Stories to tell stories in Agile
- Fowler (2004) - UML Distilled - describes UML as a sketch tool for communication, not as a formal specification language
- Reeves (1992) wrote the groundbreaking article stating that code is the real design, not the diagrams
- Van der Wal (n.d.) provides practical explanation of domain modeling

See the [References](#references) section at the bottom for full citations.

### The lesson from Reeves

The article by Reeves (1992) is particularly relevant: he argues that high-level programming languages are just one step in a spectrum. The "real" code is machine code - everything above it is a form of design. This means:

1. **Diagrams** are design at a high level of abstraction
2. **High-level code** (Java, Python, TypeScript) is design at a lower level
3. **Machine code** is the ultimate implementation

Therefore, it's essential to learn how to write high-level programming languages so they **align with the design**. The code must tell the story - just like this fairy tale of Little Red Riding Hood.

### In conclusion

Just as Little Red Riding Hood eventually came home safely, we hope that after reading this example you:

- Understand when to use natural language and when to use formal diagrams
- Know how to split large stories into manageable parts
- Realize that code is also a form of storytelling
- Are ready to tell your own software stories - accessible to everyone

---

## And then...

*"They lived happily ever after"* is a nice ending, but provides few starting points for a good story. What happens after "happily ever after"? In software terms: what happens after the first release?

### Specifying and validating: the story continues

The goal of most software products is to make the user happy. But how do you know if your user is really happy? This is where **specification** and **validation** come in:

| Activity | Question | Method |
|----------|----------|--------|
| **Specifying** | "What do we want to build?" | User Stories, Use Cases, Acceptance Criteria |
| **Validating** | "Did we build the right thing?" | User testing, A/B testing, feedback loops |
| **Verifying** | "Did we build it right?" | Unit tests, integration tests, code reviews |

Just like with Little Red Riding Hood: the story doesn't end at "happily ever after". Grandmother might have PTSD, the Wolf has family that wants revenge, and Little Red is considering a career as a hunter. The real work begins after the first version.

### The technical term: Enshittification

Unfortunately, "happily ever after" is not always the reality. Doctorow (2023) introduced the (socio-)technical term **enshittification** to describe how many large social media platforms first create value for users, then for advertisers, and ultimately only for themselves.

Interestingly, economic research (Dubner, 2024) shows that many users would *pay* to make platforms like Facebook disappear. The "happily ever after" has become an illusion.

### What does this mean for software development?

When designing software, ask yourself:

1. **Who are you optimizing for?** The user, the company, or the shareholders?
2. **What is the long-term vision?** Will the software continue to deliver value, or will it become an extraction machine?
3. **How do you measure "happy"?** Engagement metrics are not the same as user satisfaction

This directly relates to the specification question: if you write User Stories from the user's perspective ("As a user I want..."), but the acceptance criteria optimize for advertisers, then you have a fundamental conflict.

---

## About this article

This article was written by Bart van der Wal with Claude (Anthropic) as co-author. Claude helped structure the content, generate the PlantUML diagrams, and formulate the philosophical reflections.

:::info Feedback welcome
Although I (Bart) am ultimately responsible for the content, feedback on any errors or unclear sections is very welcome. Report issues via [GitHub](https://github.com/AIM-ENE/remark-kroki-a11y/issues) or get in touch.
:::

---

## References

- Fowler, M. (2004). *UML Distilled: A Brief Guide to the Standard Object Modeling Language* (3rd ed.). Addison-Wesley. https://martinfowler.com/books/uml.html
- Doctorow, C. (2023, January 21). *Tiktok's enshittification*. Pluralistic. https://pluralistic.net/2023/01/21/potemkin-ai/
- Dubner, S. J. (Host). (2024, January 18). *Are you caught in a social media trap?* [Podcast episode]. In *Freakonomics Radio*. Freakonomics, LLC. https://freakonomics.com/podcast/are-you-caught-in-a-social-media-trap/
- Hoare, C. A. R. (1980). The emperor's old clothes. *Communications of the ACM, 24*(2), 75-83. https://doi.org/10.1145/358549.358561
- Patton, J. (2014). *User story mapping: Discover the whole story, build the right product*. O'Reilly Media.
- Reeves, J. W. (1992). What is software design? *C++ Journal, 2*(2). https://www.developerdotstar.com/mag/articles/reeves_design.html
- Van der Wal, B. (n.d.). *Domeinmodellen* [Domain models]. Minor DevOps. https://minordevops.nl/blok-2/domein-model.html

---

## Appendices

### Appendix A: Detailed Domain Model (Fowler-style)

For software developers who want to see a more formal domain model, we show below the Fowler-style version: with data types, visibility modifiers, and methods.

```kroki imgType="plantuml" imgTitle="Little Red Riding Hood: Detailed Domain Model (Fowler-style)" lang="en" customDescription="Detailed class diagram with inheritance. LittleRedRidingHood, Grandmother, and Huntsman inherit from abstract class FairyTaleCharacter, which has an association with Weapon. This means any character can wield a weapon - not just the Huntsman. The Wolf is a separate class. This modernized model passes the Bechdel test: female characters can have agency and weapons too."
@startuml
!theme plain
title Once upon a time... the domain model of Little Red Riding Hood (Fowler-style)

abstract class FairyTaleCharacter {
  -name: String
  +speak(text: String)
  +act()
}

class Weapon {
  -name: String
  -damage: int
  +use(target: FairyTaleCharacter)
}

class LittleRedRidingHood extends FairyTaleCharacter {
  -hasHood: boolean = true
  +depart()
  +knock()
  +ask(text: String)
  +fetchStones(): Stone[]
  +defend()
}

class Mother {
  -name: String
  +giveBasket(contents: Object[]): Basket
  +giveTask(text: String)
}

class Basket {
  -cookies: Cookie[]
  -wine: Bottle
}

class Wolf {
  -hungry: boolean = true
  -disguise: String = null
  +ask(text: String): String
  +devisePlan()
  +take(route: Route, destination: Location)
  +disguise(as: Person)
  +eatUp(victim: FairyTaleCharacter)
  +getIntoBed()
}

class Grandmother extends FairyTaleCharacter {
  -sick: boolean = true
  +openDoor()
}

class Huntsman extends FairyTaleCharacter {
  +hears(sound: String)
  +decides(action: String)
  +cutBellyOpen(wolf: Wolf)
  +sew(belly: String)
}

class House {
  -location: String = "deep in the forest"
  -hasBed: boolean = true
}

class Stone {
  -weight: int
}

FairyTaleCharacter "0..1" --> "0..*" Weapon : wields

Mother --> LittleRedRidingHood : is mother of
LittleRedRidingHood --> Basket : carries
Grandmother --> House : lives in
Wolf --> Grandmother : visits / eats
Wolf --> LittleRedRidingHood : meets / eats
Huntsman --> Wolf : opens belly of
Huntsman --> "0..*" Stone : puts in wolf

note as N1
  Any FairyTaleCharacter can wield a Weapon.
  Little Red could have defended herself!
  (Passes the Bechdel test)
end note

@enduml
```

:::tip The Bechdel Test and software modeling
This modernized domain model illustrates an important point: **design choices reflect values**. By giving all `FairyTaleCharacter` instances access to `Weapon`, we model a world where Little Red and Grandmother have agency - they *could* defend themselves.

The [Bechdel test](https://en.wikipedia.org/wiki/Bechdel_test) asks whether a story features at least two women who talk to each other about something other than a man. Our original model implicitly failed this: Grandmother only exists to be eaten, Little Red only to be rescued by a man.

In software terms: **your domain model encodes assumptions**. If your e-commerce model has `Customer` and `Admin` where only `Admin` can issue refunds, you've encoded a power structure. Question your models!
:::

#### Differences between Larman and Fowler style

| Aspect | Larman-style (simple) | Fowler-style (detailed) |
|--------|----------------------|------------------------|
| **Data types** | No | Yes (`String`, `boolean`, etc.) |
| **Methods** | No | Yes (`eatUp()`, `knock()`, etc.) |
| **Visibility** | No | Yes (`-` private, `+` public) |
| **Use case** | Domain exploration, communication | Technical design, implementation |

The simple Larman-style model is better for communicating with stakeholders, while the Fowler-style model is better for developers who need to implement the system.

---

### Appendix B: The "God Diagram" (anti-pattern)

:::danger Anti-pattern
The diagram below is an **anti-pattern**. We show it here explicitly to demonstrate why you should NOT do this. This is the diagram equivalent of the second situation that Hoare (1980) describes:

> "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies."

Creating a "God Diagram" is choosing the second option: so complex that you can no longer see the flaws.
:::

```kroki imgType="plantuml" imgTitle="ANTI-PATTERN: God Diagram with all phases" lang="en" customDescription="This is an anti-pattern. A combined sequence diagram with ALL interactions from phases A, B, and C. The diagram is deliberately too large and confusing to show why you should not do this. It contains more than 40 interactions and is virtually unreadable."
@startuml
title ANTI-PATTERN: Little Red Riding Hood - God Diagram\n(Do NOT do this!)

autonumber

actor "Mother" as Mother
participant "Little Red" as LR
participant "Wolf" as Wolf
participant "Grandmother" as Grandma
actor "Huntsman" as Huntsman

== PHASE A: Departure ==

Mother -> LR: giveBasket(cookies, wine)
Mother -> LR: "Bring this to grandmother,\nand stay on the path!"
LR -> LR: depart()

== PHASE A: Encounter in the forest ==

Wolf -> LR: "Good day, where are you going?"
LR --> Wolf: "To grandmother's house\nin the forest"
Wolf -> Wolf: devisePlan()
note right: Wolf decides to\ntake shorter path
Wolf -> Wolf: take(shortestRoute, grandmasHouse)

== PHASE B: Wolf arrives first ==

Wolf -> Grandma: knock()
Grandma --> Wolf: "Who is there?"
Wolf -> Grandma: "Little Red with cookies"
Grandma -> Grandma: openDoor()
Wolf -> Grandma: eatUp()
destroy Grandma
note right: Grandmother is eaten

Wolf -> Wolf: disguise(asGrandmother)
Wolf -> Wolf: getIntoBed()

== PHASE B: Little Red arrives ==

LR -> Wolf: knock()
Wolf --> LR: "Come in, dear"
LR -> Wolf: "Grandmother, what big\neyes you have!"
Wolf --> LR: "All the better\nto see you with"
LR -> Wolf: "Grandmother, what big\nears you have!"
Wolf --> LR: "All the better\nto hear you with"
LR -> Wolf: "Grandmother, what a big\nmouth you have!"
Wolf --> LR: "All the better\nto eat you with!"

Wolf -> LR: eatUp()
destroy LR
note right: Little Red is eaten

== PHASE C: Discovery ==

Huntsman -> Huntsman: hears(loudSnoring)
Huntsman -> Huntsman: decides(investigate)
Huntsman -> Wolf: enterHouse()

note over Huntsman, Wolf: Huntsman sees Wolf\nwith fat belly

== PHASE C: Rescue ==

Huntsman -> Wolf: cutBellyOpen()

create LR
Wolf --> LR: <<rescued>>
create Grandma
Wolf --> Grandma: <<rescued>>

LR --> Huntsman: "Thank you!"
Grandma --> Huntsman: "Thank you!"

== PHASE C: Punishment ==

LR -> LR: fetch(stones)
LR -> Wolf: fillBelly(stones)
Huntsman -> Wolf: sew(bellyClosed)
Wolf -> Wolf: triesToFlee()
Wolf -> Wolf: falls(downAndDies)
destroy Wolf

@enduml
```

### Why is this an anti-pattern?

1. **Unreadable** - Even with a relatively simple story like Little Red Riding Hood, the diagram is already overwhelming
2. **No focus** - You can't see what it's about without studying the entire diagram
3. **Hard to maintain** - Every change potentially affects the entire diagram
4. **Not accessible** - A screen reader cannot generate a useful description of this
5. **Analysis paralysis** - You drown in complexity

### The solution: decomposition

The way to solve a large problem (or tell an extensive story) is to split it into sub-problems and solve each sub-problem separately. Not by creating one large solution at once, because then you drown in complexity.

The biggest challenge is often to ultimately **validate** the entire solution as a composition of your partial solutions. You have the additional problem that you must also make the partial solutions connect well to each other. You need an **integration test** or even an **end-to-end test**, in addition to unit tests for your components.

### Software Engineering as Design Science

Software Engineering is a *Design Science* (DS). This anti-pattern illustrates the DS equivalent of the fact that a good/useful whole (system) is more than just the sum of its parts (elements). Splitting into parts is necessary, but the art is to design those parts so that together they form a coherent whole.

Or, as we stated in the introduction: just like with C4 diagrams, you use different zoom levels. You need an overview AND detailed views - but not everything in one diagram.
