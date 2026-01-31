// @ts-check
// Docusaurus config for minimal plugin testing

const { docs } = require("./sidebars");
const rehypeRaw = require('rehype-raw').default;

// MDX node types to pass through (not processed by rehype-raw)
const passThrough = [
  'mdxFlowExpression',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'mdxjsEsm',
];

module.exports = {
  title: 'remark-kroki-a11y test',
  url: 'http://localhost',
  baseUrl: '/',
  // docs config must be under presets, not at the root
  favicon: 'img/favicon.ico',
  organizationName: 'test',
  projectName: 'test-docusaurus-site',
  onBrokenLinks: 'throw',
  // Client-side module for tab switching
  clientModules: [
    require.resolve('../src/diagramTabs.js'),
  ],
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          remarkPlugins: [
            // Local plugin for expandable source/a11y tabs
            [require('../src/index.js'), {
              showSource: true,
              showA11yDescription: true,
              cssClass: 'diagram-expandable-source',
              languages: ['kroki'],
              locale: 'en',
            }],
            // Kroki plugin for PlantUML, GraphViz, etc.
            [require('remark-kroki-plugin'), {
              krokiBase: 'https://kroki.io',
              lang: 'kroki',
              imgRefDir: '/img/kroki',
              imgDir: 'static/img/kroki',
            }],
          ],
          rehypePlugins: [
            // Enable raw HTML in MDX (needed for remark plugin HTML output)
            [rehypeRaw, { passThrough }],
          ],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
