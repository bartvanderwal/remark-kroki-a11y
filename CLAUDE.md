# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A Remark plugin that adds accessible source code details and natural language descriptions to Kroki diagrams in Docusaurus.

## Development Commands

```bash
# From repository root:
./start-docs.sh                    # Start documentation site (recommended)

# From test-docusaurus-site/:
npm start                          # Dev server (fast, NO link validation)
npm run start:strict               # Dev server WITH link validation (recommended)
npm run build                      # Production build with full validation
npm run stop                       # Kill process on port 3001
```

## Dev/Prod Parity (12-Factor Principle X)

**CRITICAL**: `npm start` does NOT validate broken links - only `npm run build` does.

This violates the [12-Factor App principle of Dev/Prod Parity](https://12factor.net/dev-prod-parity): issues that break CI/CD should also break local development.

### Always use `start:strict` for development

```bash
# GOOD: Catches broken links before CI
npm run start:strict

# BAD: Broken links only discovered in CI pipeline
npm start
```

The `start:strict` script runs a full build first (validating links), then starts the dev server.

### Why this matters

The `docusaurus.config.js` has `onBrokenLinks: 'throw'`, but this setting only applies during `docusaurus build`, not during `docusaurus start`. This means:

- Local dev with `npm start`: broken links are silently ignored
- CI pipeline with `npm run build`: broken links fail the build

This asymmetry causes frustrating "works on my machine" situations.

## Architecture

- **Plugin source**: `src/index.js` - Main remark plugin
- **Test site**: `test-docusaurus-site/` - Docusaurus site for testing/documentation
- **ADRs**: `docs/adr/` - Architecture Decision Records

## Testing

```bash
npm test                           # Run BDD tests
npm run test:watch                 # Watch mode
```

## Publishing

```bash
npm version patch|minor|major      # Bump version
npm publish                        # Publish to npm
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development setup.

## Important: Do NOT Generate a11yDescriptionOverride

**Never add `a11yDescriptionOverride` attributes to diagram code blocks.**

The goal of this project is automatic description generation through deterministic parsers. When an LLM (like you, Claude) adds `a11yDescriptionOverride` attributes, it undermines this goal - it makes it look like the plugin generates good descriptions when it's actually just using manually written text.

Exception: Keep exactly one example in the test-docusaurus-site that demonstrates the `a11yDescriptionOverride` feature for documentation purposes.

## Writing Style Guidelines

### Leeswijzer (Reading Guide)

When writing a "leeswijzer" (reading guide) in documentation:

- Write it as flowing prose at the end of the introduction, not as a separate section
- Do NOT use a heading like "## Leeswijzer"
- Do NOT use tables or bullet lists - a leeswijzer is a textual variant of a table of contents
- Keep it brief: 2-3 sentences that guide the reader through the structure of the document
