# ADR: Replace archived remark-kroki-plugin dependency

## Status

Pending

## Context

The `remark-kroki-a11y` plugin currently wraps `remark-kroki-plugin` to add accessibility features (source code display, natural language descriptions) to Kroki-generated diagrams. However, `remark-kroki-plugin` has been **archived** by its owner:

- Repository: https://github.com/atooni/remark-kroki-plugin
- Archived: December 7, 2024 (read-only)
- Last npm publish: v0.1.1, over a year ago
- Dependencies: Uses outdated `remark@^13.0.0`
- Open issues: 2 unresolved bugs
- Forks: 3, none actively maintained

This creates problems:

1. **MDX 2/3 compatibility**: The plugin generates `raw` HTML nodes that require `rehype-raw` with special configuration in Docusaurus 3
2. **No bug fixes**: Open issues will never be addressed upstream
3. **Complex setup**: Users must configure multiple plugins in correct order
4. **Security risk**: No security updates for archived dependency
5. **Adoption visibility**: Consumers install both `remark-kroki-a11y` and `remark-kroki-plugin`, so usage is fragmented and setup remains leaky

### Code assessment

The `remark-kroki-plugin` codebase is small and manageable:

- ~130 lines of TypeScript core logic
- Dependencies: `ts-md5`, `unist-util-visit`, `node-fetch`
- Simple architecture: visits code blocks, POSTs to Kroki API, caches SVGs locally

## Options

### Option A: Integrate remark-kroki-plugin code

Fork and integrate the `remark-kroki-plugin` code directly into `remark-kroki-a11y`.

**Pros:**

- Full control over the codebase
- Can fix MDX 2/3 compatibility issues properly
- Can address the 2 open bugs
- Simpler installation for users (one plugin instead of two)
- No dependency on archived project
- Can optimize for our specific use case

**Cons:**

- Maintenance burden for Kroki API integration
- Need to keep up with Kroki service changes
- ~130 lines of additional code to maintain

### Option D: Compose with internal dependency + adapter

Use `remark-kroki-plugin` as an internal dependency of `remark-kroki-a11y`, exposed via an adapter layer.

**Pros:**

- Consumers install only `remark-kroki-a11y`
- No code duplication
- Single public API contract
- Enables internal replacement later (`remark-kroki`, own fork) without consumer API changes

**Cons:**

- Short-term dependency on archived upstream remains
- Requires adapter maintenance for API/AST compatibility
- Security and maintenance risk remain until engine replacement

### Option B: Keep wrapping remark-kroki-plugin

Continue using `remark-kroki-plugin` as an external dependency.

**Pros:**

- Less code to maintain
- No immediate work required

**Cons:**

- Technical debt accumulates
- Dependency on dead project
- Complex user setup with `rehype-raw` workaround
- Cannot fix upstream bugs
- Risk of future incompatibilities

### Option C: Switch to remark-kroki (show-docs)

Switch to the actively maintained [`remark-kroki`](https://github.com/show-docs/remark-kroki) package.

**Package info:**

- Repository: https://github.com/show-docs/remark-kroki
- npm: `remark-kroki` v0.3.8 (published Oct 2025)
- Stars: 34 | Forks: 4 | Contributors: 2
- Last update: Added MDX 3.0 support
- Dependencies: Modern (`unist-util-visit@^5`, `node-fetch@^3`)

**Features:**

- Multiple output formats: inline SVG, base64-encoded images, HTML object tags
- Docusaurus v2 and v3 compatible
- MDX 3.0 support built-in
- Customizable Kroki server configuration
- Language alias support

**Pros:**

- Actively maintained with recent MDX 3.0 support
- Modern dependencies (no outdated remark@13)
- No `rehype-raw` workaround needed (supports MDX3 target)
- Drop-in replacement potential
- Community maintained

**Cons:**

- Different API - requires adapter work in remark-kroki-a11y
- Less control than full integration (Option A)
- Still external dependency (though healthy one)
- Need to verify compatibility with our a11y wrapper approach

## Decision

Status: *Pending - requires further evaluation*

Primary direction under evaluation: **Option D (compose + adapter)**.

Rationale:

1. Consumers configure one package (`remark-kroki-a11y`)
2. No duplication of archived plugin code
3. Creates a migration seam for future engine replacement

Secondary direction: **Option C (switch to `remark-kroki`)**.

Rationale:

1. Actively maintained with MDX 3.0 support already built-in
2. Modern dependencies, no `rehype-raw` workaround needed
3. Healthier long-term posture than archived `remark-kroki-plugin`

Option A remains valid if:

- Deep customization is required for a11y behavior
- Adapter-based compatibility is not sufficient
- Full ownership is preferred over external engine dependency

**Next step:** Prototype Option D first, then validate Option C behind the same adapter contract.

## Consequences

If Option A is chosen:

- Major version bump required (breaking change to API)
- Need to document migration path for existing users
- Can provide unified configuration for both Kroki and a11y options
- Should consider making `rehype-raw` requirement explicit or automatic

If Option D is chosen:

- Minor (or patch) release if public API remains unchanged
- Consumers can remove direct `remark-kroki-plugin` dependency
- Requires adapter contract tests to keep behavior stable
- Enables future engine swap without breaking consumers

## Actions

1. [ ] Define adapter contract (supported options + expected output)
2. [ ] Prototype Option D (internal dependency + adapter)
3. [ ] Add contract tests (fixtures for markdown -> AST/HTML)
4. [ ] Prototype Option C behind same adapter seam
5. [ ] Make final decision (D temporary vs direct C vs A)
6. [ ] Implement, test, and document migration guidance

## References

- GitHub Issue: https://github.com/bartvanderwal/remark-kroki-a11y/issues/17
- Archived upstream: https://github.com/atooni/remark-kroki-plugin
- Alternative: https://github.com/show-docs/remark-kroki
- Kroki API: https://kroki.io/

---

*Date: 2026-02-09*
*Author: Bart van der Wal & Claude*
