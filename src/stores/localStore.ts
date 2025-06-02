import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { LocalStorage, useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import type { ThemeName } from 'src/components/lib/themes';
import { getThemeBackground } from 'src/components/lib/themes';
import type { HeaderInfo } from 'src/types/apiTypes';
import { getTestHeaderInfo } from 'src/types/test';
import { apiGet, apiPost } from '../api/apiWrapper';

export const useLocalStore = defineStore('header', () => {
  const q = useQuasar();
  const router = useRouter();

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  const loading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');

  // State - converted from state object to individual refs
  const authenticated = ref<boolean>((LocalStorage.getItem('authenticated') as boolean) || false);
  const headerInfo = ref<HeaderInfo>(
    LocalStorage.getItem('header') || {
      username: '',
      avatarUrl: '',
      isAdmin: false,
    },
  );

  const theme = ref<string>(LocalStorage.getItem('theme') || 'theme-violet');
  const darkMode = ref<boolean>(LocalStorage.getItem('isDarkMode') === true);
  const debugMode = ref<boolean>((LocalStorage.getItem('isDebugMode') as boolean) || false);

  // Getters - converted to computed properties
  const isAuthenticated = computed(() => authenticated.value);
  const isDebugMode = computed(() => debugMode.value);
  const isDarkMode = computed(() => darkMode.value);
  const themeBackground = computed(() => getThemeBackground(theme.value as ThemeName));

  function toggleDebugMode() {
    debugMode.value = !debugMode.value;
    LocalStorage.set('isDebugMode', debugMode.value);
  }

  function setAuthState(state: boolean) {
    authenticated.value = state;
    LocalStorage.set('authenticated', state);
  }

  function setHeaderInfo(info: HeaderInfo) {
    headerInfo.value = info;
    LocalStorage.set('header', info);
  }

  function setHeaderAvatar(avatar: string) {
    headerInfo.value.avatarUrl = avatar;
    LocalStorage.set('header', headerInfo.value);
  }

  // Additional helper function to toggle isDarkMode
  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    LocalStorage.set('isDarkMode', isDarkMode.value);
  }

  // Set theme function
  function setTheme(newTheme: string) {
    theme.value = newTheme;
    LocalStorage.set('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  }

  async function login(credentials: { username: string; password: string }) {
    error.value = false;
    errorMessage.value = '';

    if (isDebugMode.value) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      error.value = false;
      setAuthState(true);
      setHeaderInfo(getTestHeaderInfo());
      await router.push('/');
      return;
    }

    const apiData = await apiPost('/auth/login/', credentials, axiosConfig);

    if (apiData.error === false) {
      setAuthState(true);
      setHeaderInfo(apiData.data);
      q.notify({
        type: 'positive',
        message: 'Login Sucessful',
      });
      await fetchCsrfToken();
      await router.push('/');
      error.value = false;
    } else {
      error.value = true;
      errorMessage.value = apiData.errorMessage || 'Authentication failed';
      setAuthState(false);
    }
  }

  async function logout() {
    const apiData = await apiPost('/auth/logout/', {}, axiosConfig);
    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Logout Sucessful',
      });
      await fetchCsrfToken();
      await clearAll();
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage || 'Logout failed',
      });
      await router.push('/');
    }
  }

  async function fetchCsrfToken() {
    const csrfData = await apiGet('/auth/csrf_cookie/', {
      withCredentials: true,
    });
    if (csrfData.error === true) {
      q.notify({
        type: 'warning',
        message: 'CSRF token update failed. You may need to refresh.',
        icon: 'refresh',
        actions: [{ label: 'Refresh', handler: () => window.location.reload() }],
      });
    }
  }

  async function getAuthState() {
    if (isDebugMode.value) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAuthState(true);
      return;
    }

    const apiData = await apiGet('/auth/authenticated/', axiosConfig);
    if (apiData.error === false) {
      setAuthState(apiData.data.isAuthenticated as boolean);
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage || 'Failed to get auth state',
      });
      setAuthState(false);
    }
  }

  async function getHeaderInfo() {
    loading.value = true;

    if (isDebugMode.value) {
      setHeaderInfo(getTestHeaderInfo());
      setAuthState(true);
      loading.value = false;
      return;
    }

    const apiData = await apiGet('/profile/profiles/header_info/', axiosConfig);

    if (apiData.error === false) {
      setHeaderInfo(apiData.data);
      setAuthState(true);
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage || 'Failed to get user information',
      });
    }

    loading.value = false;
  }

  async function redirectIfAuthenticated() {
    if (isAuthenticated.value) {
      q.notify({
        type: 'warning',
        message: 'You are already logged in',
      });
      await router.push('/');
    }
  }

  async function clearAll() {
    LocalStorage.clear();
    await router.push('/');
  }

  // Initialize Quasar dark mode when store is first used
  onMounted(() => {
    // Set initial dark mode
    if (q) {
      q.dark.set(isDarkMode.value);
    }
    setTheme(theme.value);
  });

  // Watch isDarkMode changes and update Quasar
  watch(
    () => isDarkMode.value,
    (newDarkMode) => {
      if (q) {
        q.dark.set(newDarkMode);
      }
    },
  );

  // Return all state, getters and actions
  return {
    // State
    authenticated,
    headerInfo,
    darkMode,
    theme,
    debugMode,
    error,
    errorMessage,
    loading,

    // Getters
    isAuthenticated,
    isDebugMode,
    themeBackground,
    isDarkMode,

    // Actions
    toggleDebugMode,
    login,
    toggleDarkMode,
    setTheme,
    logout,
    setHeaderAvatar,
    fetchCsrfToken,
    getAuthState,
    clearAll,
    getHeaderInfo,
    redirectIfAuthenticated,
  };
});
