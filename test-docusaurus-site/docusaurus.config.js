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
  title: 'remark-kroki-a11y',
  tagline: 'Accessible diagram descriptions for Kroki diagrams in Docusaurus',
  url: 'https://bartvanderwal.github.io',
  baseUrl: '/remark-kroki-a11y/',
  // docs config must be under presets, not at the root
  favicon: 'img/favicon.ico',
  organizationName: 'bartvanderwal',
  projectName: 'remark-kroki-a11y',
  trailingSlash: false,
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
  themes: [
    [
      require.resolve('@cmfcmf/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        language: 'en',
      },
    ],
  ],
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
              imgRefDir: '/remark-kroki-a11y/img/kroki',
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
  themeConfig: {
    navbar: {
      title: 'remark-kroki-a11y',
      items: [
        {
          type: 'doc',
          docId: 'index',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'doc',
          docId: 'examples/index',
          position: 'left',
          label: 'Examples',
        },
        {
          href: 'https://github.com/bartvanderwal/remark-kroki-a11y',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'Examples',
              to: '/examples',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/bartvanderwal/remark-kroki-a11y',
            },
            {
              label: 'Issues',
              href: 'https://github.com/bartvanderwal/remark-kroki-a11y/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Kroki.io',
              href: 'https://kroki.io',
            },
            {
              label: 'Docusaurus',
              href: 'https://docusaurus.io',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Bart van der Wal. Built with Docusaurus.`,
    },
  },
};
