// @ts-check
// Docusaurus config for minimal plugin testing

const { docs } = require("./sidebars");
const rehypeRaw = require('rehype-raw').default;
const { version: pluginVersion } = require('../package.json');

// MDX node types to pass through (not processed by rehype-raw)
const passThrough = [
  'mdxFlowExpression',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxTextExpression',
  'mdxjsEsm',
];

module.exports = async function createConfigAsync() {
  const { default: remarkQuizdown } = await import('./src/remark/remark-quizdown.mjs');
  const krokiBase = process.env.KROKI_BASE_URL || 'https://kroki.io';
  return {
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
    require.resolve('./src/quizdown-client.js'),
  ],
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
    // Enable Mermaid for client-side rendering (separate from Kroki-Mermaid)
    mermaid: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  themes: [
    // Theme for client-side Mermaid rendering
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        language: ['en'],
        hashed: true,
        docsRouteBasePath: '/',
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
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          remarkPlugins: [
            // Experimental parser for ```quiz fenced blocks
            remarkQuizdown,
            // Mermaid A11y plugin for native ```mermaid blocks (client-side rendered)
            // MUST come BEFORE theme-mermaid processes the blocks
            [require('../src/mermaid-a11y'), {
              locale: 'en',
              generateA11yDescription: true,
              summaryText: 'Mermaid source for "{title}"',
              a11ySummaryText: 'Accessible description for "{title}"',
            }],
            // Kroki A11y plugin for ```kroki blocks (server-side rendered)
            [require('../src/index.js'), {
              showSource: true,
              showA11yDescription: true,
              showSpeakButton: true,
              cssClass: 'diagram-expandable-source',
              languages: ['kroki'],
              locale: 'en',
              kroki: {
                krokiBase,
                lang: 'kroki',
                imgRefDir: '/remark-kroki-a11y/img/kroki',
                imgDir: 'static/img/kroki',
              },
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
          docId: 'readme-github',
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
        {
          href: 'https://www.npmjs.com/package/remark-kroki-a11y',
          label: `v${pluginVersion}`,
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
};
