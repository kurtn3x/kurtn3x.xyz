import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { apiGet } from './apiWrapper';
import type { UserProfile } from 'src/types/apiTypes.ts';
import { getTestUserProfile } from 'src/types/test';

export function useUserProfile() {
  const route = useRoute();
  const q = useQuasar();
  const localStore = useLocalStore();

  // State variables
  const state = reactive({
    loading: true,
    error: false,
    errorMessage: '',
  });

  const user = ref({} as UserProfile);
  const userlink = ref('kurtn3x.xyz/user/');

  // Axios configuration
  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  const getUser = async () => {
    state.loading = true;
    state.error = false;

    const userParam = route.params.username;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      state.loading = false;
      user.value = getTestUserProfile();
      userlink.value = 'kurtn3x.xyz/user/' + user.value.id;
      return;
    }

    const apiData = await apiGet(`/profile/profiles/by-username/${!userParam}/`, axiosConfig);

    if (apiData.error === false) {
      user.value = apiData.data as UserProfile;
      userlink.value = 'kurtn3x.xyz/user/' + user.value.id;
    } else {
      state.error = true;
      state.errorMessage = apiData.errorMessage;
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    state.loading = false;
  };

  return {
    state,
    user,
    userlink,
    getUser,
  };
}
