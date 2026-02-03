# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-02-03

### Added

- **Activity diagram support (Beta)** - PlantUML activity diagrams now generate accessible natural language descriptions
  - Supports: start/stop, activities (`:text;`), decision points (`if/else/endif`), partitions, while loops, and fork/join (parallel execution)
  - Output format uses intuitive numbering: "Start", "Stap 1. Activity", "Partitie A: Title", "Stap A1. Sub-activity", etc.
  - Localization: Dutch (nl) and English (en)
  - BDD test coverage with 4 scenarios each in NL and EN

- **Storybook integration** - Added Storybook for visual testing and documentation of accessible components
  - DiagramTabs stories with accessibility tests
  - Visual regression testing support

- **`lang` attribute on a11y content** - The natural language description section now includes a `lang` attribute matching the configured locale, ensuring screenreaders use the correct language pronunciation

### Fixed

- **Screenreader language switching** - Screenreaders now correctly switch to the appropriate language (Dutch/English) when reading the natural language description, regardless of browser/OS language settings

- **Keyboard accessibility for tabs** - Added `tabindex="0"` to tab panel content sections (`<section role="tabpanel">`), enabling keyboard users to Tab into the content area after selecting a tab

### Changed

- Partitions in activity diagrams use letter-based sub-step numbering (e.g., "Stap A1", "Stap B2") instead of numeric sub-numbering
- Start and Stop nodes are displayed without step numbers in activity diagram descriptions (just "Start" and "Stop")

## [0.3.4] - Previous release

### Added

- Sequence diagram support (Beta) for PlantUML and Mermaid
- Class diagram support for PlantUML (Full) and Mermaid (To test)
- State diagram support for PlantUML (Full)
- Custom description support via `customDescription` attribute
- Localization support for Dutch and English

### Features

- Expandable source code blocks with `<details>` element
- Tabs interface for source code and natural language descriptions
- Per-diagram control with `hideSource`, `hideA11y`, and `hideDiagram` flags
- Keyboard accessible using native HTML elements
