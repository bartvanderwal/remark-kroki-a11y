# ADR: Integrated Test Docusaurus Site

## Status

Accepted

## Context

The `remark-kroki-a11y` plugin needs to be tested in a real Docusaurus environment to verify that:

1. The plugin correctly integrates with Docusaurus's remark pipeline
2. Generated A11y descriptions render correctly in HTML output
3. The plugin works with various PlantUML and Mermaid diagram types
4. Both English and Dutch localization work as expected

There are several approaches to provide documentation and testing for plugin users:

- **Option 1: README.md only** - Document usage and configuration in the README.md file. Users must set up their own Docusaurus site to test the plugin.

- **Option 2: Integrated test-docusaurus-site** - Include a complete Docusaurus test site within the plugin repository that demonstrates all plugin features and serves as an integration test environment.

- **Option 3: External test site** - Maintain a separate repository with a Docusaurus site for testing the plugin.

- **Option 4: No testing infrastructure** - Leave all testing to library users. This provides no safety net for bugs and no reference implementation for users.

## Decision

We choose **Option 2: Integrated test-docusaurus-site**.

The plugin includes a `test-docusaurus-site` directory containing:

- A complete Docusaurus configuration with the plugin enabled
- Example markdown pages demonstrating various diagram scenarios
- Both English and Dutch localization examples
- Pages covering different modeling styles (Larman analysis vs Fowler design)

This approach aligns with the **Manual Risk-Based Testing** practice described in the Continuous Delivery Maturity Model (Humble & Farley, 2010). By including a working reference site, we can:

1. Manually verify plugin behavior after changes
2. Provide a reference implementation for users
3. Demonstrate real-world usage scenarios
4. Enable visual inspection of rendered A11y descriptions

## Consequences

### Positive

- **Reduced barrier for contributors**: New developers can immediately run the test site and see the plugin in action
- **Living documentation**: The test site serves as always-up-to-date documentation of plugin capabilities
- **Integration testing**: Catch issues that unit tests might miss (e.g., CSS conflicts, build pipeline issues)
- **Reference for users**: Plugin users can copy configuration and patterns from the test site

### Negative

- **Maintenance overhead**: The test site must be updated when the plugin API changes
- **Repository size**: Including a full Docusaurus setup increases the repository footprint
- **Potential drift**: If not regularly tested, the test site may become outdated

### Mitigation

- Include `npm run build` of the test-site in CI/CD pipeline
- Keep test site minimal but comprehensive
- Document the test site's purpose clearly in README.md

## References

- Humble, J., & Farley, D. (2010). *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Addison-Wesley Professional.
- InfoQ. (2014). [Continuous Delivery Maturity Model](https://www.infoq.com/articles/Continuous-Delivery-Maturity-Model/).

---

*Date: 2026-01-31*
*Author: Bart van der Wal & Claude Code*
