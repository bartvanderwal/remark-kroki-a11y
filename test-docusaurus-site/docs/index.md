# remark-kroki-a11y

A [Remark](https://github.com/remarkjs/remark) plugin that adds accessible source code details and natural language descriptions to [Kroki](https://kroki.io/) diagrams.

[![npm version](https://img.shields.io/npm/v/remark-kroki-a11y.svg)](https://www.npmjs.com/package/remark-kroki-a11y)
[![license](https://img.shields.io/npm/l/remark-kroki-a11y.svg)](https://github.com/bartvanderwal/remark-kroki-a11y/blob/main/LICENSE)
[![Node.js](https://img.shields.io/node/v/remark-kroki-a11y.svg)](https://nodejs.org/)

```bash
npm install remark-kroki-a11y
# or
yarn add remark-kroki-a11y
```

[View on npm](https://www.npmjs.com/package/remark-kroki-a11y) | [GitHub](https://github.com/bartvanderwal/remark-kroki-a11y)

:::tip Meta
This documentation site is itself powered by remark-kroki-a11y! Every diagram you see here demonstrates the plugin's accessibility features.
:::

## Features

- **Expandable source code** - Adds a collapsible `<details>` block with the diagram source code below each diagram
- **Natural language descriptions** - Generates human-readable descriptions for screen readers
- **Tabs interface** - Uses tabs when source and description are available
- **Keyboard accessible** - Uses native `<details>` element that works with Enter/Space
- **Localization** - Supports Dutch (nl) and English (en)
- **Per-diagram control** - Use `hideSource`, `hideA11y`, or `customDescription` flags

## Quick Demo

Here's a class diagram with automatically generated accessible description:

```kroki imgType="plantuml" imgTitle="Strategy Pattern" lang="en"
@startuml
class Woordenlijst {
  -woorden : String[]
  +sorteer() : void
  +setSorteerStrategie(strategie : SorteerStrategie) : void
}
interface SorteerStrategie {
  +sorteer(woorden : String[]) : void
}
class MergeSort {
  +sorteer(woorden : String[]) : void
}
class ShellSort {
  +sorteer(woorden : String[]) : void
}
class QuickSort {
  +sorteer(woorden : String[]) : void
}
Woordenlijst --> "1" SorteerStrategie : huidigeStrategie
MergeSort ..|> SorteerStrategie
ShellSort ..|> SorteerStrategie
QuickSort ..|> SorteerStrategie
@enduml
```

---

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
              locale: 'en', // or 'nl'
            }],
            [require('remark-kroki-plugin'), {
              krokiBase: 'https://kroki.io',
              lang: 'kroki',
            }],
          ],
        },
      },
    ],
  ],
};
```

## Supported Diagram Types

| Diagram Type | PlantUML | Mermaid | Status |
|--------------|----------|---------|--------|
| Class diagrams | ✅ Full | ⚠️ To test | Partial |
| State diagrams | ✅ Full | ❌ | Partial |
| Sequence diagrams | ⚠️ Beta | ⚠️ Beta | Partial |
| C4 diagrams | ❌ | N/A | Planned |
| ER diagrams | ❌ | ❌ | Planned |

---

## Next Steps

- Browse the [Examples](/examples) to see the plugin in action
- Check the [Architecture](/architecture/plugin-architecture) for technical details
- View the [BDD Test Report](/test-results/cucumber-report.html) for test coverage
- Contribute on [GitHub](https://github.com/AIM-ENE/remark-kroki-a11y)
