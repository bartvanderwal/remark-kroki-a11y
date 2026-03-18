# AGENTS.md

## ADR Writing Standards

### Scope

- Keep ADRs at architecture level (black-box behavior, trade-offs, decision, consequences).
- Do not include low-level design option trees unless they are architecturally relevant.

### ADR structure in this repo

- Required: `Status`, `Context`, `Options`, `Decision`, `Consequences`.
- Optional: `References` (only when concrete sources are cited in-text).
- Do **not** add `Actions` as a standard ADR section.

### Reference policy (APA / sources)

- Follow HAN APA guidance when references are present.
- Only add references for specific, informative deep links (article, manual page, API doc page, paper, etc.).
- Avoid generic homepage references (for example product landing pages).
- Add an in-text paraphrase or quote when citing a source.
- Keep Nygard template reference centralized in ADR index docs (`docs/adr/README.md` and its published copy) to avoid repetition (DRY).

### Documentation sync

- `docs/adr/*` is the source of truth.
- Keep `test-docusaurus-site/docs/adr/*` aligned when ADR content changes.
