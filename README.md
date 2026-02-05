# remark-kroki-a11y

[![npm version](https://img.shields.io/npm/v/remark-kroki-a11y.svg)](https://www.npmjs.com/package/remark-kroki-a11y)
[![license](https://img.shields.io/npm/l/remark-kroki-a11y.svg)](https://github.com/bartvanderwal/remark-kroki-a11y/blob/main/LICENSE)
[![Node.js](https://img.shields.io/node/v/remark-kroki-a11y.svg)](https://nodejs.org/)
[![BDD Tests](https://img.shields.io/badge/BDD%20tests-38%20passing-brightgreen)](https://github.com/bartvanderwal/remark-kroki-a11y)

A [Remark](https://github.com/remarkjs/remark) plugin that adds accessible source code details and natural language descriptions to [Kroki](https://kroki.io/) diagrams.

> **Note:** This plugin has only been tested with [Docusaurus](https://docusaurus.io/). It should work with other unified/remark-based systems, but this has not been verified.

## Features

- **Expandable source code** - Adds a collapsible `<details>` block with the diagram source code below each diagram
- **Natural language descriptions** - Generates human-readable descriptions for screen readers (currently supports PlantUML state diagrams)
- **Tabs interface** - Always uses tabs when source and (generated or fallback) description are available
- **Keyboard accessible** - Uses native `<details>` element that works with Enter/Space
- **Localization** - Supports Dutch (nl) and English (en)
- **Per-diagram control** - Use `hideSource` or `hideA11y` flags to control visibility

## Supported Diagram Types

Works with any diagram type supported by [Kroki](https://kroki.io/), including:

- PlantUML
- Mermaid
- C4 (via PlantUML)
- GraphViz
- And many more...

### Current A11y Description Support

| Diagram Type | PlantUML | Mermaid | Status |
|--------------|----------|---------|--------|
| Class diagrams | ✅ Full | ⚠️ To test | Partial |
| State diagrams | ✅ Full | ❌ | Partial |
| Sequence diagrams | ⚠️ Beta | ⚠️ Beta | Partial |
| Activity diagrams | ⚠️ Beta | ❌ | Partial |
| C4 diagrams | ❌ | N/A | Planned |
| ER diagrams | ❌ | ❌ | Planned |
| Gantt charts | ❌ | ❌ | Future |

## Roadmap

### Diagram-as-Code Formats

We support multiple diagram-as-text formats through Kroki:

| Format | UML Support | C4 | Other |
|--------|-------------|-----|-------|
| **PlantUML** | All 14 UML types | ✅ via C4-PlantUML | Mindmaps, Gantt, etc. |
| **Mermaid** | Class, Sequence, State, ER | ❌ | Flowchart, Pie, etc. |

### Future Diagram Types (Student Projects Welcome!)

These diagram types don't have good diagram-as-text standards yet:

- **Domain Stories** ([egon.io](https://egon.io)) - Visual storytelling for domain modeling
- **User Story Maps** - Story mapping for agile planning
- **Event Storming** - Domain event visualization

### Architecture

We use PlantUML's data structure as internal representation (IR) with adapters for each input format. See [ADR-0006](docs/adr/0006-plantuml-als-interne-standaard.md) for details.

The official [`@mermaid-js/parser`](https://www.npmjs.com/package/@mermaid-js/parser) npm package provides AST parsing for Mermaid diagrams, enabling conversion to our IR.

For all architecture decisions, see the [Architecture Decision Records (ADRs)](docs/adr/README.md).

## Installation

```bash
npm install remark-kroki-a11y
# or
yarn add remark-kroki-a11y
```

## Usage with Docusaurus

In your `docusaurus.config.js`:

```js
module.exports = {
  presets: [
    [
      'classic',
      {
        docs: {
          remarkPlugins: [
            // This plugin MUST come BEFORE remark-kroki-plugin
            [require('remark-kroki-a11y'), {
              showSource: true,
              showA11yDescription: true,
              defaultExpanded: false,
              summaryText: '{type} source code for "{title}"',
              a11ySummaryText: 'Natural language description for "{title}"',
              tabSourceLabel: 'Source',
              tabA11yLabel: 'Description',
              cssClass: 'diagram-expandable-source',
              languages: ['kroki'],
              locale: 'en',
            }],
            [require('remark-kroki-plugin'), {
              krokiBase: 'https://kroki.io',
              lang: 'kroki',
              imgRefDir: '/img/kroki',
              imgDir: 'static/img/kroki',
            }],
          ],
        },
      },
    ],
  ],
};
```

### Client Module for Tabs

Tabs are always used when both source and a11y text are present (generated or fallback). Add the client module `src/clientModules/diagramTabs.js`:

```js
export function onRouteDidUpdate() {
  const tabContainers = document.querySelectorAll('.diagram-expandable-source-tabs');

  tabContainers.forEach((container) => {
    const buttons = container.querySelectorAll('.diagram-expandable-source-tab-btn');
    const contents = container.querySelectorAll('.diagram-expandable-source-tab-content');

    buttons.forEach((button) => {
      if (button.dataset.tabListener) return;
      button.dataset.tabListener = 'true';

      button.addEventListener('click', () => {
        const tabId = button.dataset.tab;

        buttons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        contents.forEach((content) => {
          content.classList.toggle('active', content.dataset.tab === tabId);
        });
      });
    });
  });
}
```

And register it in `docusaurus.config.js`:

```js
module.exports = {
  clientModules: [
    require.resolve('./src/clientModules/diagramTabs.js'),
  ],
  // ...
};
```

### CSS Styling

Add the following CSS to your custom stylesheet:

```css
/* Expandable source code block for diagrams */
.diagram-expandable-source summary {
  cursor: pointer;
  font-weight: 500;
  padding: 0.25rem 0;
  user-select: none;
  font-size: 0.9em;
}

.diagram-expandable-source summary:hover {
  color: var(--ifm-color-primary);
}

.diagram-expandable-source pre {
  background: var(--prism-background-color, #1e1e1e);
  color: var(--prism-color, #d4d4d4);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.5rem 0;
}

/* Tabs styling */
.diagram-expandable-source-tab-buttons {
  display: flex;
  border-bottom: 1px solid var(--ifm-color-emphasis-300);
}

.diagram-expandable-source-tab-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.diagram-expandable-source-tab-btn.active {
  color: var(--ifm-color-primary);
  border-bottom-color: var(--ifm-color-primary);
}

.diagram-expandable-source-tab-content {
  display: none;
}

.diagram-expandable-source-tab-content.active {
  display: block;
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showSource` | boolean | `true` | Show source code tab |
| `showA11yDescription` | boolean | `true` | Show natural language description tab |
| `defaultExpanded` | boolean | `false` | Expand details by default |
| `summaryText` | string | `'{type} source code for "{title}"'` | Summary text template |
| `a11ySummaryText` | string | `'Natural language description for "{title}"'` | A11y summary text template |
| `tabSourceLabel` | string | `'Source'` | Label for source tab |
| `tabA11yLabel` | string | `'Description'` | Label for description tab |
| `cssClass` | string | `'diagram-expandable-source'` | CSS class for the details element |
| `languages` | string[] | `['kroki']` | Code block languages to process |
| `locale` | string | `'en'` | Locale for generated descriptions (`'en'` or `'nl'`) |
| `fallbackA11yText` | object | `{ en: '...', nl: '...' }` | Override fallback text per locale |

## Markdown Flags

Control per-diagram behavior using flags in the code block meta:

~~~markdown

<!-- Hide source code for this diagram -->
```kroki hideSource imgType="plantuml"
@startuml
...
@enduml
```

<!-- Hide natural language description for this diagram -->
```kroki hideA11y imgType="plantuml"
@startuml
...
@enduml
```

<!-- Override automatic description with custom text -->
```kroki customDescription="Zie toelichting in tekst voor beschrijving van dit diagram" imgType="plantuml"
@startuml
...
@enduml
```

~~~

The `customDescription` attribute is useful when:

- The diagram type is not yet supported for automatic description generation
- You want to provide a more context-specific description
- The automatic description doesn't capture the intended meaning

## Accessibility

This plugin improves diagram accessibility by:

1. **Providing source code** - Screen readers can read the diagram syntax (PlantUML, Mermaid, etc.) which describes the structure
2. **Generating natural language descriptions** - For supported diagram types, creates human-readable text descriptions
3. **Keyboard navigation** - Uses native `<details>` elements accessible via keyboard

## Documentation Site

This plugin includes a live documentation site built with Docusaurus that besides documenting the plugin also demonstrates all features with working examples.

### Running Locally

```bash
# From the repository root:
./start-docs.sh

# Or manually:
cd test-docusaurus-site
npm install  # first time only
npm start
```

The documentation site will be available at `http://localhost:3001/remark-kroki-a11y/`.

### Online Documentation

📖 **Live documentation:** [bartvanderwal.github.io/remark-kroki-a11y](https://bartvanderwal.github.io/remark-kroki-a11y/)

### CI/CD Pipeline

The documentation site is automatically built and deployed to GitHub Pages on every push to `main`.

The pipeline:

1. Copies hybrid documentation (README, CONTRIBUTING, ADRs) with Docusaurus front-matter
2. Builds the Docusaurus site with the remark-kroki-a11y plugin
3. Deploys to GitHub Pages

### Single Source of Truth

The `README.md` and `CONTRIBUTING.md` files are maintained in the repository root for GitHub visibility. These files are automatically copied to the Docusaurus docs folder by `start-docs.sh` (with added front-matter for Docusaurus).

**Important:** Do NOT add Docusaurus-specific front-matter (the `---` YAML block) to these root files, as they need to render correctly on GitHub. The `start-docs.sh` script adds the necessary front-matter when copying.

## Meta: Eating Our Own Dog Food

This project has a delightful meta aspect: we build an accessibility plugin for "diagrams-as-code" in Docusaurus, and we use Docusaurus with those same diagrams to document the plugin itself.

![Strategy Pattern class diagram example](docs/img/strategy-pattern-example.svg)

**The technical domain:** The plugin operates in the landscape of Markdown, HTML generation, and diagram-as-code syntaxes (PlantUML, Mermaid). We use these same tools to document the plugin's architecture with C4 diagrams, class diagrams, and sequence diagrams.

**The problem domain:** We address accessibility (a11y) for visual diagrams - a challenge driven by both the [continuous documentation](https://www.writethedocs.org/guide/docs-as-code/) movement in software engineering and broader societal/legal requirements like [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) and the [European Accessibility Act](https://ec.europa.eu/social/main.jsp?catId=1202).

To see a more concrete example check the Docusaurus page with diagrams and documentation for this plugin itself. We also use that to test/validate our own plugin.

In short: *A plugin that makes software diagrams accessible, and uses diagrams to explain how we do that (and these then test/validate if we are succeeding).*

## Acknowledgments

This plugin was originally conceived by [Remco Veurink](https://www.linkedin.com/in/remco-veurink-01a76521/), lecturer at HAN University of Applied Sciences.

### Related Work

The Mermaid project is also exploring accessibility for diagram-as-code. As noted in their [accessibility discussion](https://github.com/mermaid-js/mermaid/issues/5632):

> While I recognize that this is not going to be easy, I also believe that Mermaid is uniquely situated to solve this problem. The entire concept of Mermaid is that we can represent this visual content as plain structured text. Mermaid diagrams aren't just static images generated in Photoshop; they are rendered dynamically from structured data.

This insight applies equally to PlantUML and other diagram-as-code formats - the structured source text is inherently accessible, we just need to present it properly.

## Contributing

Want to help? Or update and run this plugin itself? See [CONTRIBUTING.md](CONTRIBUTING.md) for local development setup and publishing tips.

For quality standards and acceptance criteria, see the [Definition of Done](definition-of-done.md).

## License

MIT
