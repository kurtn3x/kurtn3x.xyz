import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { apiGet, apiPost } from './apiWrapper';

export interface RegisterData {
  username: string;
  password: string;
  passwordConfirm: string;
  email: string;
}

export interface CaptchaData {
  img: string;
  id: string;
  value: string;
  loading: boolean;
  error: boolean;
}

export function useRegister() {
  const localStore = useLocalStore();
  const q = useQuasar();
  const router = useRouter();

  const state = reactive({
    loading: false,
    error: false,
    errorMessage: '',
    registerSuccessful: false,
  });

  const captchaState = reactive<CaptchaData>({
    img: '',
    id: '',
    value: '',
    loading: true,
    error: false,
  });

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  const getCaptcha = async () => {
    captchaState.value = '';
    captchaState.loading = true;

    try {
      const apiData = await apiGet('/auth/captcha/', axiosConfig);
      if (apiData.error === false) {
        Object.assign(captchaState, apiData.data);
        captchaState.loading = false;
      } else {
        captchaState.error = true;
        captchaState.loading = false;
      }
    } catch {
      captchaState.error = true;
      captchaState.loading = false;
    }
  };

  const register = async (registerData: RegisterData, captchaValue: string, captchaId: string) => {
    state.loading = true;
    state.error = false;
    state.errorMessage = '';

    const payload = {
      ...registerData,
      captchaId,
      captchaValue,
    };

    try {
      const apiData = await apiPost('/auth/register/', payload, axiosConfig);
      if (apiData.error === false) {
        state.registerSuccessful = true;
      } else {
        state.error = true;
        state.errorMessage = apiData.errorMessage;
        await getCaptcha();
      }
    } catch {
      state.error = true;
      state.errorMessage = 'Network error occurred';
      await getCaptcha();
    } finally {
      state.loading = false;
    }
  };

  const redirectIfAuthenticated = async () => {
    if (localStore.isAuthenticated) {
      await router.push('/');
    }
  };

  return {
    state,
    captchaState,
    register,
    getCaptcha,
    redirectIfAuthenticated,
  };
}
