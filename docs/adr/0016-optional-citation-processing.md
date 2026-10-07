# ADR: Optional citation processing for documentation

## Status

Accepted

## Context

The project uses APA-style references in ADRs and documentation, following HAN guidance, but references are usually authored and formatted manually. This is repetitive and makes consistent in-text citations, linked bibliography entries, and generated bibliographies harder to maintain.

`rehype-citation` processes Markdown citations and generates formatted bibliographies during the server-side unified/rehype pipeline. Its documentation describes APA style, BibTeX input, citation links, and optional tooltips [@rehypeCitation].

The test site uses Docusaurus 3 with MDX 3. Citation processing is an independent documentation concern; the remark-kroki-a11y plugin should not gain a runtime dependency or citation-specific behavior for it.

## Options

### Option A: Continue formatting all references manually

Keep the current approach without adding citation-processing setup.

### Option B: Bundle citation processing with remark-kroki-a11y

Make citation formatting part of the plugin or install and configure it as a dependency of the plugin.

### Option C: Recommend rehype-citation as an optional Docusaurus plugin

Keep citation processing separate from the plugin, provide setup guidance, and validate it in the Docusaurus test site.

## Decision

Choose **Option C**. Recommend rehype-citation as an optional, build-time documentation plugin. Do not bundle it with remark-kroki-a11y or make it part of the plugin's runtime behavior.

The test site demonstrates APA formatting, generated bibliography entries, citation links, and tooltips with MDX 3. Tooltips are an optional enhancement; readers must still have the visible citation and bibliography.

## Consequences

- Documentation authors can use a BibTeX bibliography and avoid manually formatting supported references.
- Authors retain control over whether their Docusaurus site uses citation processing.
- The main plugin remains focused on accessible Kroki diagrams and does not add citation-related dependencies.
- Existing manually written references remain valid and need not be migrated.
- The test site depends on rehype-citation and keeps its bibliography as a test fixture.

## References

The bibliography for this ADR is generated from the test site's `references.bib` file.

---

*Date: 2026-10-07*
*Author: Bart van der Wal & GitHub Copilot*
