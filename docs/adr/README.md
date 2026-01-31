# Architecture Decision Records (ADR)

This ADR overview describes the main architectural decisions for the remark-kroki-a11y codebase. Each ADR documents a choice, context, alternatives, and consequences, following the format by Michael Nygard (2011).

## Format used

Each ADR contains the following sections:

- Status
- Context
- Options (our addition)
- Decision
- Consequences
- Actions (if applicable)
- References (our addition, APA style per HAN)

**Deviations from Nygard's original format:**

1. *Options*: We explicitly add an 'Options' section to list and motivate alternatives considered, for clarity and traceability.
2. *References*: We use a 'References' section at the end, formatted in APA style as prescribed by HAN guidelines ([HAN APA reference guide](https://factlearning.wordpress.com/wp-content/uploads/2016/02/controlekaart-documenten-ica.pdf)).

See: Nygard, M. (2011). Documenting architecture decisions. Retrieved from https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html

## ADR overview

- **0001-relatie-richting-en-bijectiviteit.md**  
  Make UML relation direction explicit in natural language output for bijectivity.
- **0002-plugin-architectuur.md**  
  Choose a plain JavaScript remark plugin as the base, with optional MDX/JSX/React extensions.
- **0003-project-language.md**  
  All documentation and ADRs in this repository are in English for open source accessibility.

---

*Last update*: 2026-01-31
