# ADR: Project language and documentation

## Status

Accepted

## Context

The remark-kroki-a11y plugin is intended to be open sourced and used by an international audience. While at least the original consuming projects are in Dutch, the plugin itself and its documentation should be accessible to the global developer community.

## Options

- **Option 1: Dutch as primary language**  
  All code comments, documentation, and ADRs are written in Dutch. This matches some consuming projects but limits accessibility and contributions from the broader open source community.
- **Option 2: English as primary language**  
  All code comments, documentation, and ADRs are written in English. This is the de facto standard for open source and web projects, and maximizes accessibility and collaboration.

## Decision

All documentation, code comments, and ADRs in the remark-kroki-a11y repository will be written in English. Consuming projects should use their own language, but the plugin itself will use English as the default language for all technical communication.

## Consequences

- The project is accessible to a global audience and open source contributors.
- Consistency with best practices for open source and web projects.
- Dutch-specific documentation or examples should be placed in consuming projects, not in the plugin repository.

## Actions

- Translate all existing ADRs and documentation to English.
- Update contribution guidelines to specify English as the project language.

## References

- [Why open source projects use English](https://opensource.guide/how-to-contribute/#what-it-means-to-be-open-source)

---

*Date*: 2026-01-31
*Author*: Bart van der Wal enhanced by GitHub Copilot
