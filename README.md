# remark-kroki-a11y

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

Natural language description generation currently supports:
- PlantUML state diagrams

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

~~~

## Accessibility

This plugin improves diagram accessibility by:

1. **Providing source code** - Screen readers can read the diagram syntax (PlantUML, Mermaid, etc.) which describes the structure
2. **Generating natural language descriptions** - For supported diagram types, creates human-readable text descriptions
3. **Keyboard navigation** - Uses native `<details>` elements accessible via keyboard

## Contributing

Want to help? Or update and run this plugin itself? See [CONTRIBUTING.md](CONTRIBUTING.md) for local development setup and publishing tips.

## License

MIT
