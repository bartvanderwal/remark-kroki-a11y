# ADR-0003: Require rehype-raw for MDX Compatibility

## Status

Accepted

## Context

Docusaurus 3 uses MDX 3, which does not automatically parse raw HTML. This plugin generates `type: 'html'` AST nodes containing `<details>` elements for expandable source code blocks.

### The Problem

When a remark plugin injects raw HTML nodes into the AST:

```javascript
{
  type: 'html',
  value: '<details><summary>Source</summary>...</details>'
}
```

MDX 3 ignores these nodes because it expects JSX, not raw HTML. The HTML simply disappears from the output in `.mdx` files, while the same code works fine in `.md` files.

## Decision

Require `rehype-raw` plugin in the `rehypePlugins` configuration:

```javascript
const rehypeRaw = require('rehype-raw').default;

// In docusaurus.config.js:
docs: {
  remarkPlugins: [...],
  rehypePlugins: [rehypeRaw],  // Required for raw HTML in MDX
}
```

Note: `.default` is required because `rehype-raw` is an ESM module.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Rename `.mdx` to `.md` | Works without config change | Loses MDX features (JSX components, imports) |
| Use JSX nodes instead of HTML | Native MDX support | More complex AST manipulation |
| Create React components | Full React ecosystem | Overkill for simple `<details>` elements |

## Consequences

### Positive

- Raw HTML works in both `.md` and `.mdx` files
- Minimal configuration change (one line)
- No breaking changes to existing content
- Consistent behavior across file types

### Negative

- Additional dependency (`rehype-raw`)
- Easy to forget during setup (documented in README)
- Slight increase in build complexity

## References

- [MDX and HTML](https://mdxjs.com/docs/what-is-mdx/#html)
- [rehype-raw on npm](https://www.npmjs.com/package/rehype-raw)
- [Docusaurus MDX plugins](https://docusaurus.io/docs/markdown-features/plugins)
