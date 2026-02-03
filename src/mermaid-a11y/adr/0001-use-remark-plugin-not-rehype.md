# ADR-0001: Use Remark Plugin (not Rehype) for Diagram Processing

## Status

Accepted

## Context

We need to add accessibility features (expandable source code, screen reader descriptions) to Mermaid diagrams in Docusaurus. Docusaurus supports two types of MDX plugins:

- **Remark plugins**: Process Markdown AST before HTML conversion
- **Rehype plugins**: Process HTML-like AST after conversion

As [Docusaurus explains](https://docusaurus.io/docs/markdown-features/plugins#creating-new-rehyperemark-plugins), these serve different purposes. The documentation uses the math plugin as an example: `remark-math` extracts `$...$` patterns (syntax), while `rehype-katex` renders the actual formulas (presentation).

## Decision

Implement this as a **remark plugin** because:

1. We need to detect and process `mermaid` code blocks in the Markdown AST
2. The plugin modifies the AST structure by injecting `<details>` HTML nodes
3. Diagram rendering is handled separately by `@docusaurus/theme-mermaid`

## Consequences

### Positive

- Clear separation of concerns: syntax detection (remark) vs rendering (theme-mermaid)
- Can swap diagram rendering (native Mermaid vs Kroki) without rewriting accessibility features
- Works with the standard Docusaurus plugin architecture
- Uses `unist-util-visit` for AST traversal as recommended by Docusaurus

### Negative

- Must execute before other diagram plugins to modify the AST first
- Raw HTML nodes require `rehype-raw` for MDX compatibility (see ADR-0003)

## References

- [Docusaurus MDX Plugins Documentation](https://docusaurus.io/docs/markdown-features/plugins#creating-new-rehyperemark-plugins)
- [unist-util-visit](https://github.com/syntax-tree/unist-util-visit)
