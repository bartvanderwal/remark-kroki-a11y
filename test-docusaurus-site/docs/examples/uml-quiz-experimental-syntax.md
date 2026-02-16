---
sidebar_label: UML Quiz (Syntax)
---

# UML Quiz (Syntax)

This page demonstrates the `quiz` block parser syntax.
It includes:

1. Single-choice options (`- ( )` / `- (x)`)
2. Multi-correct checkbox options (`- [ ]` / `- [x]`)
3. Open short-answer with accepted variants and max length (`= ... ~10`)

```quizz debug=true
? Which diagram type is used for the three-phase overview in the Red Riding Hood example?
! Look for the diagram with swimlanes and process flow across phases.
- ( ) Class diagram
- (x) Activity diagram
- ( ) Sequence diagram
- ( ) Use case diagram

? Which statements about sequence diagrams are correct?
! Think in terms of time-ordered messages between participants.
- [x] They show interactions over time.
- [ ] They replace all class diagrams.
- [x] They can show self-messages.
- [ ] They only model databases.

? Name one participant from the Red Riding Hood sequence diagrams.
! Use one actor/lifeline name from the story diagrams.
= wolf / little red / grandmother / huntsman ~20
```
