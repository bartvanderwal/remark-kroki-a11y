# ADR 001: Quiz Authoring Model (`.md` marker vs `.mdx` JSX)

## Status

Proposed

## Date

2026-03-09

## Context

We currently have two quiz component implementations in the broader DoEx ecosystem:

1. `doex/studenten/src/components/Quiz/index.tsx` (DoEx-specific implementation)
2. `doex/submodules/remark-kroki-a11y/test-docusaurus-site/src/components/Quiz/index.jsx` (test-site implementation)

This is confusing and causes feature drift.

### Current feature mismatch

The DoEx quiz implementation includes features such as:
- disabling the "Check answers" action (`disableAnswerCheck`)
- custom disabled message (`disabledCheckAlertMessage`)
- optional info note
- unlock code gating

The test-site implementation includes features such as:
- score display
- reset button
- per-question hint toggling

Neither implementation currently provides a robust rich-content authoring model for questions/answers. Most quiz content is authored as string fields in JSX/MDX props (`question: string`, `answer.text: string`), which limits composition.

### Authoring pain points

For open-source usage and long-term maintainability, we need:
- quiz authoring in `.md` (not requiring JSX-heavy MDX)
- rich content in questions and answers (bold/italic, links, code blocks, diagrams, admonitions)
- compatibility with existing markdown pipelines (including `remark-kroki-a11y` / diagram tooling)

The current JSX-prop model does not naturally support embedded markdown/AST content in each answer block.

## Decision

We will converge to a single open-source quiz package (working name: `quizzosaurus`) and move toward a markdown-native authoring model using markers/directives in `.md`.

### Key direction

1. **Single source of truth**
   - Unify quiz behavior into one reusable npm package.
   - Both DoEx and other projects consume this package.

2. **Rich-content capable model**
   - Move away from string-only question/answer fields.
   - Represent question and answer content as markdown/AST children.

3. **`.md` marker/directive authoring**
   - Introduce a remark-based quiz marker/directive syntax in markdown.
   - Convert markers into quiz component nodes during markdown processing.

4. **Feature parity before replacement**
   - Preserve and combine key capabilities from both existing implementations:
     - check-button disable and custom messaging
     - unlock behavior
     - score/reset/hints
     - accessibility and keyboard behavior

5. **Compatibility path**
   - Keep a backward-compatible adapter for existing MDX JSX usage temporarily.
   - Deprecate old JSX-prop-only authoring after migration.

## Why this decision

- Reduces duplication and maintenance overhead.
- Enables open-source reuse across repositories.
- Restores authoring flexibility in plain markdown.
- Supports richer pedagogical content (formatted text, diagrams, structured blocks) inside quiz items.

## Consequences

### Positive

- One maintained quiz implementation.
- Better content ergonomics for course authors.
- Cleaner migration path from MDX-heavy pages to markdown-first pages.
- Improved consistency in UX and behavior.

### Trade-offs / Risks

- Requires design and implementation of a marker/directive syntax and parser.
- Needs migration tooling and documentation for existing quiz content.
- Requires careful handling of nested markdown rendering and validation.

## Implementation sketch (phased)

1. **Unification phase**
   - Merge feature sets from both components into one package API.

2. **Authoring phase**
   - Define markdown quiz directive schema.
   - Implement remark transform to component AST.

3. **Migration phase**
   - Add compatibility layer for legacy MDX JSX quizzes.
   - Migrate content gradually to `.md` markers.

4. **Deprecation phase**
   - Deprecate old direct JSX data model once coverage is complete.

## Out of scope for this ADR

- Exact marker syntax details.
- Final package name and release process.
- Detailed visual design tokens for quiz UI.

## References

- DoEx quiz component:
  - `doex/studenten/src/components/Quiz/index.tsx`
- test-site quiz component:
  - `doex/submodules/remark-kroki-a11y/test-docusaurus-site/src/components/Quiz/index.jsx`
