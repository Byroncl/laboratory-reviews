// @ts-check
const {themes} = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Post-Message',
  tagline: 'Documentación de Arquitectura Backend & Frontend',
  favicon: 'img/favicon.ico',

  url: 'https://example.com',
  baseUrl: '/',

  organizationName: 'laboratory-reviews',
  projectName: 'post-message-docs',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },


  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Documentación Post-Message',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            label: 'Backend',
            position: 'left',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentación',
            items: [
              {
                label: 'Guía Backend',
                to: '/docs/backend/intro',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Post-Message.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'typescript'],
      },
    }),
};

module.exports = config;
