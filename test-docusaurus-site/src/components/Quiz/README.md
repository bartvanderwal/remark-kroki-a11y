# Quiz Component Spec (Proposed)

This document specifies the next version of the quiz component used in the
`test-docusaurus-site`.

## Goals

1. Match the existing DoEx UX for validation feedback:
   - selected correct answer gets green styling
   - selected wrong answer gets red styling
   - the correct answer is highlighted after validation
2. Support rich answer content (Markdown), not plain text only.
3. Make hints/explanations opt-in (shown only when the learner asks for them).
4. Move from JSON/JSX quiz authoring to a Markdown-first authoring format.
5. Prepare extraction into reusable packages.

## Product names and layering

### Layer 1: `QuizDown` (core, reusable)

`QuizDown` is the parser + data model + render-agnostic logic.

- Input: Markdown quiz syntax inside fenced code block: ````quiz`
- Output: normalized quiz AST / JSON model
- No React/Docusaurus dependency
- Target: reusable across static site generators

### Layer 2: `Quizzosaurus` (Docusaurus adapter)

`Quizzosaurus` is the Docusaurus/MDX integration + UI renderer.

- Input: `QuizDown` model
- Output: interactive React UI in Docusaurus
- Uses theme variables and Docusaurus build pipeline

Both can coexist. `Quizzosaurus` consumes `QuizDown`.

## Authoring syntax (required)

Authoring should support this fenced format:

````md
```quiz
### 1. Question text

Optional paragraphs with *italic* and **bold** markdown.

```java
public static void main(String[] args) {
  System.out.println("Hello, World!" + args[0]);
}
```

- ( ) Answer A
- (x) Answer B
- ( ) Answer C
- ( ) Answer D

### 2. Other question text

- (x) First answer (default correct if no option is marked)
- ( ) Second answer
- ( ) Third answer
- 4. ( ) All of the above

### 3. Multi-correct question (checkbox style)

- [x] Correct option A
- [ ] Incorrect option B
- [x] Correct option C
- [ ] Incorrect option D
```
````

Marker semantics:

- `- ( )` / `- (x)` => single-choice question (radio)
- `- [ ]` / `- [x]` => multi-choice question (checkbox)
- Mixing round and square marker styles in one question is invalid.
- Open short-answer questions are supported with dedicated answer keys syntax
  (see below).

### 4. Open short-answer question (auto-gradable)

Use an answer-key block for short string answers:

````md
```quiz
### 4. Java output method with newline

Write one valid Java call that prints text and adds a newline.

answer:
- "println()"
- "System.out.println()"
- "printLn()"
```
````

Notes:

- Multiple accepted strings are allowed.
- Matching behavior is configurable (case-sensitive or case-insensitive).
- The example includes aliases/variants intentionally; parser can warn on
  suspicious spellings but still accept configured values.

## Parsing rules

1. A quiz consists of one or more questions.
2. A question starts at a heading level (initially `###`).
3. Question body supports Markdown blocks (paragraphs, code, diagrams, lists).
4. Answer options are list items with markers:
   - `- ( )` for incorrect single-choice option
   - `- (x)` for correct single-choice option
   - `- [ ]` for incorrect multi-choice option
   - `- [x]` for correct multi-choice option
5. Question selection mode is inferred:
   - round markers => `single`
   - square markers => `multiple`
6. Correctness rules by mode:
   - `single`: exactly one `(x)` expected; if none marked, first option becomes
     correct and parser emits warning
   - `multiple`: one or more `[x]` required; if none marked parser emits error
7. Optional forced ordering marker:
   - `- 4. ( ) All of the above`
   - numeric prefix controls display order relative to sibling options
8. Answer option content supports full Markdown (including fenced code blocks).
9. Diagrams in answers should render via existing markdown pipeline
   (e.g. `kroki` fenced blocks).
10. Open short-answer questions:
   - are declared using `answer:` followed by one or more string entries
   - must not include `- ( )` / `- [ ]` options in the same question
   - are represented as question type `open_short`
11. A quiz can mix question types (`single`, `multiple`, `open_short`).

## Data model (normalized)

Example shape returned by `QuizDown`:

```json
{
  "title": "Quiz",
  "questions": [
    {
      "id": "q1",
      "promptMdx": "...",
      "questionType": "single",
      "hintMdx": null,
      "answers": [
        { "id": "a", "contentMdx": "...", "isCorrect": false, "order": 1 },
        { "id": "b", "contentMdx": "...", "isCorrect": true, "order": 2 }
      ]
    },
    {
      "id": "q2",
      "promptMdx": "...",
      "questionType": "open_short",
      "hintMdx": null,
      "acceptedAnswers": [
        "println()",
        "System.out.println()",
        "System.out.print()"
      ],
      "grading": {
        "caseSensitive": false,
        "trimWhitespace": true,
        "collapseInnerWhitespace": true
      }
    }
  ],
  "warnings": []
}
```

## UX and validation behavior

1. Before submit:
   - neutral styling
   - no correctness indicators
2. After submit:
   - `single`:
     - chosen + correct => green
     - chosen + wrong => red
     - correct option is visible as correct (even if not chosen)
   - `multiple`:
     - selected + correct => green
     - selected + wrong => red
     - unselected + correct => shown as missed-correct (warning state)
   - `open_short`:
     - exact/normalized match against `acceptedAnswers` => green
     - otherwise red + optional "show expected forms" action
     - feedback must not leak all accepted answers unless explicitly enabled
3. Accessibility:
   - keyboard-only usable
   - clear focus states
   - ARIA labels/roles for question groups and feedback
4. Attempt model:
   - initial version: single attempt with reset button
   - later: configurable retry behavior

## Hint behavior (on-demand only)

Hints/explanations must not show automatically on validation.

Required behavior:

- each question may define an optional hint/explanation
- hint is shown only after explicit user action:
  - e.g. "Show hint" button per question
- default state: hidden
- optional config:
  - `allowHintsBeforeSubmit` (default `true`)
  - `allowHintsAfterSubmit` (default `true`)

## Open short-answer grading rules

Required for deterministic auto-verification:

1. Input normalization pipeline (default):
   - trim leading/trailing whitespace
   - collapse internal whitespace runs to single space
   - case-insensitive compare
2. Optional per-question overrides:
   - `caseSensitive`
   - `trimWhitespace`
   - `collapseInnerWhitespace`
3. Accepted answer set:
   - one or more strings
   - first item is canonical display answer
4. Security:
   - never evaluate code
   - string comparison only
5. Explainability:
   - when wrong, show configurable feedback:
     - generic ("Not correct yet")
     - or canonical expected form only
     - full accepted list only when explicitly configured

## Rendering strategy for rich Markdown answers

Answer/question content must be treated as Markdown/MDX fragments, not plain text.

In Docusaurus adapter (`Quizzosaurus`):

1. Parse `quiz` block with remark plugin step (`QuizDown` parser).
2. Convert parsed model to MDX AST nodes.
3. Render content fragments through MDX pipeline so formatting/code blocks/diagram
   fences are preserved.

## Backward compatibility

During transition we keep support for current JSX props:

- `questions` JSON prop remains supported
- new Markdown `quiz` block is preferred
- deprecation path for JSON-only mode to be defined after migration

## Non-goals (first iteration)

1. Randomized option order
2. Persistent scoring across pages/sessions
3. LMS/xAPI export
4. Natural language fuzzy grading with LLMs

## Milestones

1. **M1**: DoEx parity UI
   - green/red behavior identical
   - correct answer highlight after submit
2. **M2**: Hint toggle
   - hidden by default, explicit reveal action
3. **M3**: `QuizDown` parser
   - fenced `quiz` syntax to AST/model
4. **M4**: open short-answer support
   - parser + deterministic matcher with accepted variants
5. **M5**: `Quizzosaurus` integration
   - remark/MDX rendering in Docusaurus docs
6. **M6**: Package split
   - publishable `quizdown` + `quizzosaurus` packages
