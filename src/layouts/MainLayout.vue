<template>
  <q-layout view="hHh LpR fff">
    <!-- Debug Panel (only in development) -->
    <div
      v-if="nodeEnv === 'development'"
      style="position: fixed; bottom: 10px; right: 10px; z-index: 9999"
    >
      <q-btn round color="red" icon="bug_report" size="md">
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item>
              <q-item-section>
                <q-toggle v-model="debugMode" label="DEBUG" color="primary" />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="resetLocalStorage">
              <q-item-section>Reset LocalStorage</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-header reveal height-hint="98" class="bg-layout-bg text-layout-text">
      <!-- Authenticated Header -->
      <q-toolbar class="q-pa-none" v-if="localStore.isAuthenticated">
        <q-btn
          flat
          stretch
          icon="menu"
          class="text-body1 text-weight-bold"
          size="md"
          @click="
            miniState = !miniState;
            navDrawer = true;
          "
          style="width: 57px"
        />
        <q-space />

        <q-btn stretch flat class="button_hover">
          <q-avatar class="q-mr-sm" size="26px" rounded>
            <img :src="localStore.headerInfo.avatarUrl" />
          </q-avatar>
          <a class="text-body2 q-mr-sm text-weight-bold">
            {{ localStore.headerInfo.username }}
          </a>
          <q-icon name="arrow_drop_down" size="sm" />
          <UserMenu :headerInfo="localStore.headerInfo" />
        </q-btn>
      </q-toolbar>

      <!-- Public Header -->
      <q-toolbar class="q-pa-none q-ma-none" v-if="!localStore.isAuthenticated">
        <q-btn unelevated stretch icon="home" size="md" to="/" />
        <q-btn icon="settings" class="bg-transparent text-layout-text" unelevated stretch>
          <q-menu class="bg-layout-bg no-shadow">
            <theme-selector />
          </q-menu>
        </q-btn>

        <q-space />
        <q-btn
          stretch
          unelevated
          icon="login"
          :label="q.screen.gt.xs ? 'Login' : ''"
          class="text-body1 text-weight-bold"
          size="md"
          to="/login"
          :style="q.screen.gt.xs ? 'width: 140px' : 'width: 80px'"
        >
          <q-tooltip class="bg-layout-bg text-layout-text" v-if="!q.screen.gt.xs">
            <a class="text-body1">Login</a>
          </q-tooltip>
        </q-btn>

        <q-btn
          stretch
          flat
          icon="add"
          :label="q.screen.gt.xs ? 'Register' : ''"
          to="/register"
          class="text-body1 text-weight-bold q-ml-xs"
          size="md"
          :style="q.screen.gt.xs ? 'width: 140px' : 'width: 80px'"
        >
          <q-tooltip class="bg-layout-bg text-layout-text" v-if="!q.screen.gt.xs">
            <a class="text-body1">Register</a>
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- NAV DRAWER -->
    <q-drawer
      dark
      v-model="navDrawer"
      no-swipe-open
      mini-to-overlay
      side="left"
      :mini="miniState"
      class="bg-layout-bg text-layout-text column justify-between"
      v-if="localStore.isAuthenticated"
    >
      <navigation-drawer />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- FOOTER  -->
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { useRoute, useRouter } from 'vue-router';
import NavigationDrawer from 'src/components/layout/NavigationDrawer.vue';
import ThemeSelector from 'src/components/layout/ThemeSelector.vue';
import UserMenu from 'src/components/layout/UserMenu.vue';

// Setup composables
const localStore = useLocalStore();
const q = useQuasar();
const route = useRoute();
const router = useRouter();

// In your script section
const debugMode = computed({
  get: () => localStore.isDebugMode,
  set: (value) => {
    localStore.toggleDebugMode();
    if (value === true) {
      localStore.getHeaderInfo().catch(console.error);
    } else {
      localStore.clearAll().catch(console.error);
    }
  },
});

// Drawer state
const navDrawer = ref(true);
const miniState = ref(true);

// Reference to process.env for the template
const nodeEnv = process.env.NODE_ENV;

// Reset function for localStorage
const resetLocalStorage = async () => {
  await localStore.clearAll();
};

// Responsive adjustment for initial state
if (q.screen.width < 1024) {
  navDrawer.value = false;
  miniState.value = false;
}

// Authentication handling - respect debug mode
watchEffect(() => {
  const requiresAuth = route.meta.requiresAuth === true;
  if (requiresAuth && !localStore.isAuthenticated) {
    // Only redirect if not in debug mode
    if (!localStore.isDebugMode) {
      // Fire async operation without awaiting in watchEffect
      router.push('/login').catch(console.error);
    }
  }
});

watch(
  () => q.screen.width,
  (newVal) => {
    if (newVal < 1024) {
      navDrawer.value = false;
      miniState.value = false;
    } else {
      navDrawer.value = true;
      miniState.value = true;
    }
  },
);

// Lifecycle hooks
onMounted(async () => {
  if (localStore.isAuthenticated) {
    await localStore.getHeaderInfo();
  }
});
</script>
