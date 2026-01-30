// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sincronizado',
  tagline: 'Hyper-local development stack with remote AI execution',
  favicon: 'img/favicon.ico',
  url: 'https://sincronizado.micr.dev',
  baseUrl: '/',
  trailingSlash: false,
  organizationName: 'microck',
  projectName: 'sincronizado',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/microck/sincronizado/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: { type: ['rss', 'atom'], xslt: true },
          editUrl: 'https://github.com/microck/sincronizado/tree/main/docs/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: { customCss: './src/css/custom.css' },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Sincronizado',
        logo: { alt: 'Sincronizado Logo', src: 'img/logo.svg' },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          { href: 'https://github.com/microck/sincronizado', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Quick Start', to: '/docs/quick-start' },
              { label: 'Architecture', to: '/docs/architecture' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'OpenCode Discord', href: 'https://discord.gg/opencode' },
              { label: 'GitHub Issues', href: 'https://github.com/microck/sincronizado/issues' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'Blog', to: '/blog' },
              { label: 'GitHub', href: 'https://github.com/microck/sincronizado' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sincronizado. Built with Docusaurus.`,
      },
      prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
    }),
};

export default config;
