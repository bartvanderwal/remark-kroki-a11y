# APA citation processing for Docusaurus documentation

## Status

Accepted

## Context

References in the repository's hybrid Markdown documentation must render on GitHub as well as in Docusaurus. Automatic citation processing would improve consistency and can provide links and citation previews, but generated HTML alone does not provide those benefits on GitHub.

`rehype-citation` is a server-side rehype plugin that supports APA author-date citations, generated bibliographies, citation links, and tooltips (Lin, 2026). The Docusaurus test site uses Docusaurus 3 and MDX 3, while the published `remark-kroki-a11y` package does not process citations.

## Options

1. Keep references manually formatted in all documentation.
2. Add citation processing to the published plugin.
3. Keep citation processing separate from the published plugin and enable it only for Docusaurus documentation that can use the rehype pipeline.

## Decision

Choose option 3. The test site uses `rehype-citation` as a development dependency to verify APA-style processing with Docusaurus 3/MDX 3. This is an optional documentation concern and does not belong in the runtime dependencies or behavior of `remark-kroki-a11y`.

Keep hybrid Markdown and ADRs in GitHub-compatible Markdown; do not migrate their references to citation syntax that GitHub cannot render. Docusaurus-only content may opt in by configuring the rehype plugin with a BibTeX or CSL-JSON bibliography. The citation demo in the test site illustrates APA formatting, linked citations, and tooltips.

## Consequences

- Docusaurus-only documentation can generate consistent APA bibliographies with optional citation links and tooltips.
- The citation processor and its dependencies are confined to the documentation test site; users choose whether to add it to their own Docusaurus sites.
- GitHub-rendered hybrid docs retain their existing manually formatted references.
- Compiler checks with MDX 2.3 and the test site's MDX 3 compiler generated APA citations, bibliography entries, citation links, and tooltips. A complete Docusaurus build still depends on Kroki being reachable for the site's existing diagram examples.

## References

- Lin, T. (2026). *rehype-citation* (Version 2.3.2) [Computer software]. https://github.com/timlrx/rehype-citation/releases/tag/v2.3.2
