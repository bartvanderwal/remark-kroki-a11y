# ADR-0002: Use Native Mermaid instead of Kroki

## Status

Accepted

## Context

TEEX course materials contain UML class diagrams and other Mermaid-supported diagram types. We need to choose a rendering approach:

1. **Native Docusaurus Mermaid** (`@docusaurus/theme-mermaid`) - client-side rendering
2. **Kroki** (via `remark-kroki-plugin`) - server-side rendering via external API

The doex repository uses Kroki for PlantUML diagrams, but TEEX only uses Mermaid syntax.

## Decision

Use **native Docusaurus Mermaid** (`@docusaurus/theme-mermaid`) for diagram rendering.

### Rationale

Kroki has several drawbacks for this use case:

1. **External dependency**: Build fails if kroki.io is unavailable
2. **Network latency**: Each diagram requires an HTTP request during build
3. **Self-hosting complexity**: Running your own Kroki server adds infrastructure overhead
4. **Offline builds**: Cannot build documentation without internet access

Native Mermaid provides:

- Client-side rendering using Mermaid.js
- No external server required
- Works offline
- Standard Docusaurus feature with official support

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Kroki | 20+ diagram types, server-side rendering | External dependency, network required |
| PlantUML directly | Powerful UML support | Requires Java runtime, complex setup |
| Static images | No runtime dependencies | Loss of diagram-as-code benefits |

## Consequences

### Positive

- No external dependencies during build
- Faster builds (no HTTP requests)
- Works offline
- Standard Docusaurus feature
- Easier CI/CD setup

### Negative

- Only Mermaid syntax supported (not PlantUML, GraphViz, etc.)
- Client-side rendering (slightly slower initial page load)
- Limited diagram customization compared to PlantUML

## Trade-off

If you need PlantUML or other diagram formats, use Kroki (as in doex). For Mermaid-only projects, native rendering is simpler and more reliable.

## References

- [Docusaurus Mermaid theme](https://docusaurus.io/docs/markdown-features/diagrams)
- [Kroki documentation](https://kroki.io/)
- [Mermaid.js](https://mermaid.js.org/)
