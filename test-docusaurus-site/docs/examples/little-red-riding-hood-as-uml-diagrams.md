# Natural Language Stories vs Formal Programming Code

This example demonstrates how to translate a natural language story (the fairy tale of Little Red Riding Hood) into formal diagrams; specifically, UML diagrams. In this way, it provides a good introduction to (some) UML diagrams for non-technical people to get an understanding, or for beginning technical people.

Using Little Red Riding Hood is perhaps somewhat of a gimmick, but also a way to apply analysis and design to a familiar domain. Experienced IT professionals eventually reach a level where they classify technical complexity as 'accidental complexity', which you should always minimize, and domain complexity as 'inherent complexity', which you ideally want to maximize by seeking out complex domains where potentially significant value can be gained and/or (ideally) the world can be improved.

We split the story into three parts to avoid a "God Diagram". A God diagram is an anti-pattern, just like a ['God object'](https://en.wikipedia.org/wiki/God_object). Splitting is a best practice to prevent 'cognitive load'. To still provide an overview, we create a separate diagram that shows the relationships between parts. This is similar to how C4 also uses different zoom levels.

---

## Once upon a time...

Before we tell the story in sequence diagrams, we first define the "world" of the fairy tale in a class diagram. This is similar to how in software you first create your domain model before working out the use cases.

```kroki imgType="plantuml" imgTitle="Little Red Riding Hood: Domain Model" lang="en" customDescription="Class diagram with all characters and objects from the Little Red Riding Hood story. Red has a basket with cookies and wine. The Wolf has methods to disguise and eat. Grandmother lives in a house in the forest. The Huntsman has scissors and can cut open the belly and fill it with stones."
@startuml
!theme plain
title Once upon a time... the domain model of Little Red Riding Hood

class LittleRedRidingHood {
  -name: String = "Little Red"
  -hasHood: boolean = true
  +depart()
  +knock()
  +ask(text: String)
  +fetchStones(): Stone[]
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
  +eatUp(victim: Person)
  +getIntoBed()
}

class Grandmother {
  -name: String
  -sick: boolean = true
  +openDoor()
}

class Huntsman {
  -scissors: Scissors
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

### Observations about the domain model

- **Attributes** describe the state of characters (Wolf has `hungry: boolean`)
- **Methods** describe what characters can do (`eatUp(victim)`)
- **Relationships** are dynamic: they appear and disappear during the story
- The **note** warns that this is a snapshot - the story changes the relationships

This domain model is our "source code" of the fairy tale world. The sequence diagrams below show how these objects interact over time.

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

```kroki imgType="plantuml" imgTitle="Phase A: Journey to grandmother" lang="en" customDescription="Sequence diagram of phase A: Mother gives Little Red a basket with the task to go to grandmother. On the way, Little Red meets the Wolf who asks where she is going. Little Red tells about grandmother's house. The Wolf decides to take a shorter path."
@startuml
title Phase A: The journey to grandmother

autonumber

actor "Mother" as Mother
participant "Little Red" as LR
participant "Wolf" as Wolf
participant "Grandmother" as Grandma

== Departure ==

Mother -> LR: giveBasket(cookies, wine)
Mother -> LR: "Bring this to grandmother,\nand stay on the path!"
LR -> LR: depart()

== Encounter in the forest ==

Wolf -> LR: "Good day, where are you going?"
LR --> Wolf: "To grandmother's house\nin the forest"
Wolf -> Wolf: devisePlan()
note right: Wolf decides to\ntake shorter path

Wolf -> Wolf: take(shortestRoute, grandmasHouse)

@enduml
```

### Explanation of phase A

In this diagram we see the setup of the story:

- **Mother** initiates the story by giving Little Red a task
- **Little Red** receives the basket (parameters: cookies and wine)
- **Wolf** gathers information and makes a plan
- The `take(shortestRoute, grandmasHouse)` is a self-call: the Wolf decides himself

---

## Phase B: At grandmother's house

The wolf arrives first, eats grandmother, and disguises himself. Then Little Red arrives.

```kroki imgType="plantuml" imgTitle="Phase B: At grandmother's house" lang="en" customDescription="Sequence diagram of phase B: The Wolf arrives at grandmother's house and knocks. Grandmother opens, the Wolf eats her. The Wolf disguises himself as grandmother and gets into bed. Little Red arrives and knocks. After the famous dialogue about big eyes, ears and mouth, the Wolf also eats Little Red."
@startuml
title Phase B: At grandmother's house

autonumber

participant "Wolf" as Wolf
participant "Grandmother" as Grandma
participant "Little Red" as LR

== Wolf arrives first ==

Wolf -> Grandma: knock()
Grandma --> Wolf: "Who is there?"
Wolf -> Grandma: "Little Red with cookies"
Grandma -> Grandma: openDoor()
Wolf -> Grandma: eatUp()
destroy Grandma
note right: Grandmother is eaten

Wolf -> Wolf: disguise(asGrandmother)
Wolf -> Wolf: getIntoBed()

== Little Red arrives ==

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

@enduml
```

### Explanation of phase B

This diagram shows the climax of the story:

- **destroy** keyword shows that an actor "disappears" (eaten)
- The dialogue with big eyes/ears/mouth is a repeating pattern
- **Self-calls** (`disguise`, `getIntoBed`) show internal actions of the Wolf

---

## Phase C: The rescue

The huntsman hears snoring, investigates the situation and rescues Little Red and grandmother.

```kroki imgType="plantuml" imgTitle="Phase C: The rescue" lang="en" customDescription="Sequence diagram of phase C: The Huntsman hears loud snoring and decides to investigate. He enters grandmother's house, sees the Wolf with a fat belly. The Huntsman cuts the belly open and rescues Little Red and Grandmother. Little Red fetches stones that are put in the belly. The Wolf is punished."
@startuml
title Phase C: The rescue

autonumber

actor "Huntsman" as Huntsman
participant "Wolf" as Wolf
participant "Little Red" as LR
participant "Grandmother" as Grandma

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

LR --> Huntsman: "Thank you!"
Grandma --> Huntsman: "Thank you!"

== Punishment ==

LR -> LR: fetch(stones)
LR -> Wolf: fillBelly(stones)
Huntsman -> Wolf: sew(bellyClosed)
Wolf -> Wolf: triesToFlee()
Wolf -> Wolf: falls(downAndDies)
destroy Wolf

@enduml
```

### Explanation of phase C

This diagram shows the resolution:

- **create** keyword shows that Little Red and Grandmother "return"
- **`<<rescued>>`** is a stereotype indicating the type of interaction
- The Wolf receives his punishment through a series of actions

---

## Alternative: Overview as sequence diagram

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

### When to use which diagram?

| Diagram | Use case |
|---------|----------|
| **Activity diagram** | Shows **flow** and **decisions**, good for process steps |
| **Sequence diagram** | Shows **interactions** between objects/actors over time |

For the overview, the activity diagram works better because:
- It shows phases as blocks (partitions)
- It doesn't need objects at this abstraction level
- The sequence is visually clearer

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
- Booch, Rumbaugh & Jacobson (1999) - the "Three Amigos" - developed UML as a standard language for software design
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

### The real ending

Perhaps the most honest ending to our Little Red Riding Hood story is:

*"And they continued to design and document, constantly re-validating whether their users were still happy - knowing that 'happily ever after' is not a final state, but a continuous process of listening, adapting and improving."*

Or, in code:

```java
while (users.areHappy()) {
    listen(users.getFeedback());
    adapt(product);
    validate(users.getHappiness());
}
// If you get here, you've done something fundamentally wrong
```

---

## About this article

This article was written by Bart van der Wal with Claude (Anthropic) as co-author. Claude helped structure the content, generate the PlantUML diagrams, and formulate the philosophical reflections.

:::info Feedback welcome
Although I (Bart) am ultimately responsible for the content, feedback on any errors or unclear sections is very welcome. Report issues via [GitHub](https://github.com/AIM-ENE/remark-kroki-a11y/issues) or get in touch.
:::

---

## References

Booch, G., Rumbaugh, J., & Jacobson, I. (1999). *The Unified Modeling Language user guide*. Addison-Wesley.

Doctorow, C. (2023, January 21). *Tiktok's enshittification*. Pluralistic. https://pluralistic.net/2023/01/21/potemkin-ai/

Dubner, S. J. (Host). (2024, January 18). *Are you caught in a social media trap?* [Podcast episode]. In *Freakonomics Radio*. Freakonomics, LLC. https://freakonomics.com/podcast/are-you-caught-in-a-social-media-trap/

Hoare, C. A. R. (1980). The emperor's old clothes. *Communications of the ACM, 24*(2), 75-83. https://doi.org/10.1145/358549.358561

Patton, J. (2014). *User story mapping: Discover the whole story, build the right product*. O'Reilly Media.

Reeves, J. W. (1992). What is software design? *C++ Journal, 2*(2). https://www.developerdotstar.com/mag/articles/reeves_design.html

Van der Wal, B. (n.d.). *Domeinmodellen* [Domain models]. Minor DevOps. https://minordevops.nl/week-2/domein-model.html

---

## Appendices

### Appendix A: The "God Diagram" (anti-pattern)

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
