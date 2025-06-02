import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),

    children: [
      {
        path: '',
        component: () => import('src/layouts/ThemeBackground.vue'),
        children: [
          {
            path: '',
            component: () => import('src/pages/public/HomeView.vue'),
          },
          {
            path: 'login',
            component: () => import('src/pages/public/LoginView.vue'),
          },
          {
            name: 'register',
            path: 'register',
            component: () => import('src/pages/public/RegisterView.vue'),
          },
          {
            name: 'privacy',
            path: 'privacy',
            component: () => import('src/pages/public/PrivacyPolicyView.vue'),
          },
        ],
      },
      {
        path: 'user/:username',
        component: () => import('src/pages/public/UserProfileView.vue'),
      },
    ],
  },

  // public file views, these are used for file sharing
  {
    path: '/files',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      //{
      //  path: 'file/:id',
      //  component: () => import('src/pages/public/files/SharedFileView.vue'),
      // },
      //{
      //  path: 'sl/:id',
      //  component: () => import('src/pages/public/files/ShortLinkView.vue'),
      //},
    ],
  },

  // dashboard views, these include all private data views
  // these are not intended to be accessed without being logged in
  {
    path: '/dashboard',
    meta: { requiresAuth: true },
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: 'settings',
        component: () => import('src/pages/authenticated/SettingsView.vue'),
      },
      {
        path: 'settings/:page',
        component: () => import('src/pages/authenticated/SettingsView.vue'),
      },
      {
        path: 'files',
        component: () => import('src/pages/authenticated/FilesView.vue'),
      },
      {
        path: 'vpn',
        component: () => import('src/pages/authenticated/VPNView.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/NotFoundView.vue'),
      },
    ],
  },
];

export default routes;
