---
sidebar_label: UML Quiz (Multiple Choice)
---

import Quiz from '@site/src/components/Quiz';

# UML Quiz (Multiple Choice)

This is the interactive multiple-choice quiz variant for the UML introduction.

<Quiz
  title="Little Red Riding Hood UML Quiz"
  questions={[
    {
      question: "What does a class diagram mainly show?",
      options: [
        "The order of messages over time",
        "Classes, attributes, and relationships",
        "Only test results",
        "Only runtime errors"
      ],
      correctIndex: 1,
      explanation: "Class diagrams focus on structure, not time flow."
    },
    {
      question: "What does a sequence diagram mainly show?",
      options: [
        "Screen layouts",
        "File system permissions",
        "Interactions between actors/objects over time",
        "Database table definitions only"
      ],
      correctIndex: 2,
      explanation: "Sequence diagrams emphasize message flow in time order."
    },
    {
      question: "Why is splitting the story into phases A, B, and C useful?",
      options: [
        "It makes diagrams harder to maintain",
        "It reduces readability",
        "It avoids one large 'God Diagram'",
        "It removes the need for sequence diagrams"
      ],
      correctIndex: 2,
      explanation: "Smaller focused diagrams are easier to read and maintain."
    },
    {
      question: "In the domain model, what is Basket?",
      options: [
        "An actor",
        "A class/entity",
        "A sequence message",
        "A database"
      ],
      correctIndex: 1,
      explanation: "Basket is modeled as a class in the class diagram."
    }
  ]}
/>
