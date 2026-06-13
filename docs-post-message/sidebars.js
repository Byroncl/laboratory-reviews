/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a set of docs in the sidebar
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
  tutorialSidebar: [
    {
      type: 'category',
      label: '📚 Backend',
      collapsed: false,
      items: [
        'backend/intro',
        {
          type: 'category',
          label: 'Architecture',
          collapsed: false,
          items: [
            'backend/architecture/overview',
            'backend/architecture/layers',
            'backend/architecture/module-structure',
          ],
        },
        {
          type: 'category',
          label: 'Modules',
          collapsed: false,
          items: [
            'backend/modules/auth',
            'backend/modules/users',
            'backend/modules/posts',
            'backend/modules/comments',
            'backend/modules/clients',
            'backend/modules/files',
            'backend/modules/roles-permissions',
            'backend/modules/i18n',
          ],
        },
        {
          type: 'category',
          label: 'Core Features',
          collapsed: false,
          items: [
            'backend/core/guards',
            'backend/core/interceptors',
            'backend/core/filters',
            'backend/core/decorators',
            'backend/core/middleware',
          ],
        },
        {
          type: 'category',
          label: 'Database',
          collapsed: false,
          items: [
            'backend/database/schemas',
            'backend/database/relationships',
          ],
        },
        {
          type: 'category',
          label: 'Utilities',
          collapsed: false,
          items: [
            'backend/utils/crypto',
            'backend/utils/file',
            'backend/utils/string',
            'backend/utils/validation',
          ],
        },
        {
          type: 'category',
          label: 'Configuration',
          collapsed: false,
          items: [
            'backend/config/environment',
            'backend/config/setup',
          ],
        },
        {
          type: 'category',
          label: 'Real-Time',
          collapsed: false,
          items: [
            'backend/websocket/comments-gateway',
            'backend/websocket/security',
          ],
        },
        {
          type: 'category',
          label: 'Known Issues',
          collapsed: true,
          items: [
            'backend/issues/hardcoded-secrets',
            'backend/issues/orphaned-modules',
            'backend/issues/ws-auth',
            'backend/issues/i18n-inconsistency',
          ],
        },
      ],
    },
  ],
};
