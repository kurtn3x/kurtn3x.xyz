// stores/settingsStore.ts
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import type { AccountSettings, UserProfile, UserProfileUpdate } from 'src/types/apiTypes';
import { getTestAccountSettings } from 'src/types/test';
import { useLocalStore } from 'stores/localStore';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/apiWrapper';

export const useSettingsStore = defineStore('settings', () => {
  const q = useQuasar();
  const localStore = useLocalStore();

  // State
  const accountSettings = ref<AccountSettings>({} as AccountSettings);
  const avatarPreview = ref<string | null>(null);

  const loading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  // Actions
  async function getAccountInformation() {
    loading.value = true;
    error.value = false;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      loading.value = false;
      error.value = false;
      accountSettings.value = getTestAccountSettings();
      avatarPreview.value = accountSettings.value.profile.avatarUrl + '?' + Math.random();
      return;
    }

    const apiData = await apiGet('/profile/profiles/account_settings/', axiosConfig);

    if (apiData.error === false) {
      accountSettings.value = apiData.data as AccountSettings;
      avatarPreview.value = accountSettings.value.profile.avatarUrl + '?' + Math.random();
      error.value = false;
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      error.value = true;
      errorMessage.value = apiData.errorMessage;
    }
    loading.value = false;
  }

  async function updateProfile(newProfileData: Partial<UserProfileUpdate>) {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const formData = new FormData();
    if (newProfileData.name && newProfileData.name !== accountSettings.value.profile.name) {
      formData.append('name', newProfileData.name);
    }
    if (
      newProfileData.location &&
      newProfileData.location !== accountSettings.value.profile.location
    ) {
      formData.append('location', newProfileData.location);
    }
    if (
      newProfileData.description &&
      newProfileData.description !== accountSettings.value.profile.description
    ) {
      formData.append('description', newProfileData.description);
    }
    if (newProfileData.status && newProfileData.status !== accountSettings.value.profile.status) {
      formData.append('status', newProfileData.status);
    }

    if (newProfileData.avatar) {
      formData.append('avatar', newProfileData.avatar);
    }

    const apiData = await apiPatch('/profile/profiles/me/', formData, config);

    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Profile updated successfully.',
      });
      /* Patch returns the updated value */
      accountSettings.value.profile = apiData.data as UserProfile;
      if (newProfileData.avatar) {
        localStore.setHeaderAvatar((apiData.data as UserProfile).avatarUrl);
      }
      // update header info anways because it doesn't impact the site
      await localStore.getHeaderInfo();
      /* */
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
  }

  async function updateEmail(email: string, password: string): Promise<boolean> {
    const data = { email: email, password: password };
    const apiData = await apiPatch('/auth/users/me/', data, axiosConfig);

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Email updated successfully.' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      return false;
    }

    return true;
  }

  // Update user password
  async function updatePassword(
    newPassword: string,
    newPasswordConfirm: string,
    password: string,
  ): Promise<boolean> {
    const data = { currentPassword: password, newPassword: newPassword };
    const apiData = await apiPost('/auth/users/change_password/', data, axiosConfig);

    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Password changed successfully.',
      });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      return false;
    }

    return true;
  }

  // Delete user account
  async function deleteAccount(password: string): Promise<boolean> {
    const config = {
      ...axiosConfig,
      data: { password },
    };

    const apiData = await apiDelete('/auth/users/delete_account/', config);

    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Account deleted successfully.',
      });
      return true;
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
    return false;
  }

  function setAvatarPreview(avatar: File | null) {
    avatarPreview.value = URL.createObjectURL(avatar as File);
  }

  return {
    // State
    accountSettings,
    avatarPreview,
    loading,
    error,
    errorMessage,

    // Actions
    getAccountInformation,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    setAvatarPreview,
  };
});
