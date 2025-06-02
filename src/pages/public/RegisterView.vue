<template>
  <q-page class="flex flex-center items-center justify-center full-width">
    <div class="column fade-in-text q-ma-xs">
      <div v-if="!state.registerSuccessful">
        <q-card dark class="no-shadow bg-transparent register-container">
          <div
            class="q-mt-xl text3d-primary text-weight-bolder text-h3 text-center non-selectable q-mb-md"
            style="margin-top: 100px"
          >
            Register
          </div>
          <q-card-section align="center">
            <q-form @submit.prevent="submitRegister" class="q-gutter-md">
              <q-input
                v-model="registerDataRequired.username"
                label="Username"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                :rules="[
                  (val) => (val && val.length > 3) || 'At least 4 characters',
                  (val) => (val && val.length < 17) || 'Not more than 16 characters',
                  (val) => /^[a-z0-9]+$/i.test(val) || 'Only alphanumeric characters allowed.',
                  (val) => /^\S+$/.test(val) || 'No spaces allowed.',
                ]"
                class="register-field"
                ref="usernameInput"
                color="layout-text"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidUsername"
                :disable="state.loading"
              >
                <template v-slot:prepend>
                  <q-icon color="layout-text" name="person" />
                </template>

                <template v-slot:append>
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.usernameError"
                    class="bg-white text-red q-ml-md"
                    @click.prevent.stop
                  >
                    <q-tooltip
                      :class="localStore.isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'"
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">
                        <a class="text-red">4-16</a>
                        Characters.
                        <a class="text-red">Latin Alphabet & Numbers.</a>
                      </div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.usernameError"
                    color="green"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>

              <q-input
                v-model="registerDataRequired.email"
                type="email"
                label="Email"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                :rules="[
                  (val) =>
                    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                      val,
                    ) || 'Not a valid E-Mail',
                ]"
                class="register-field"
                ref="emailInput"
                color="layout-text"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidEmail"
                :disable="state.loading"
              >
                <template v-slot:prepend>
                  <q-icon color="layout-text" name="email" />
                </template>
                <template v-slot:append>
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.emailError"
                    class="bg-white text-red q-ml-md"
                  >
                    <q-tooltip
                      :class="localStore.isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'"
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">
                        A
                        <a class="text-red">valid</a>
                        email address.
                      </div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.emailError"
                    color="green"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>
              <q-input
                v-model="registerDataRequired.password"
                label="Password"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                color="layout-text"
                :rules="[
                  (val) => (val && val.length > 7) || 'At least 8 characters',
                  (val) => (val && val.length < 101) || 'Not more than 100 characters',
                ]"
                :type="isPwd ? 'password' : 'text'"
                class="register-field"
                ref="passwordInput"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidPassword"
                :disable="state.loading"
              >
                <template v-slot:prepend>
                  <q-icon color="layout-text" name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    color="layout-text"
                    class="password-toggle"
                    :name="isPwd ? 'visibility' : 'visibility_off'"
                    @click="isPwd = !isPwd"
                  />
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.passwordError"
                    class="bg-white text-red q-ml-md"
                  >
                    <q-tooltip
                      :class="localStore.isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'"
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">
                        Password with
                        <a class="text-red">8-100</a>
                        characters.
                      </div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.passwordError"
                    color="green"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>

              <q-input
                v-model="registerDataRequired.passwordConfirm"
                label="Confirm Password"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                :rules="[(val) => val == registerDataRequired.password || 'Passwords do not match']"
                :type="isPwd2 ? 'password' : 'text'"
                class="register-field"
                ref="passwordConfirmInput"
                color="layout-text"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidPasswordConfirm"
                :disable="state.loading"
              >
                <template v-slot:prepend>
                  <q-icon color="layout-text" name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    color="layout-text"
                    class="password-toggle"
                    :name="isPwd2 ? 'visibility' : 'visibility_off'"
                    @click="isPwd2 = !isPwd2"
                  />
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.passwordConfirmError"
                    class="bg-white text-red q-ml-md"
                  >
                    <q-tooltip
                      :class="localStore.isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'"
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">Passwords must match.</div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.passwordConfirmError"
                    color="green"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>
              <div class="captcha-container">
                <div class="captcha-controls">
                  <q-btn
                    icon="refresh"
                    class="captcha-btn q-mr-sm"
                    flat
                    dense
                    round
                    @click="getCaptcha"
                    :disable="state.loading"
                  />
                  <q-img
                    :src="captchaState.img"
                    spinner-color="primary"
                    width="150px"
                    height="55px"
                    class="captcha-image q-mr-sm"
                  >
                    <div class="fit flex flex-center" v-if="captchaState.loading">
                      <q-spinner color="primary" size="2em" />
                    </div>
                    <div class="text-red text-body2" v-if="captchaState.error">
                      Failed to load Captcha.
                    </div>
                  </q-img>
                  <q-input
                    v-model="captchaState.value"
                    label="Captcha"
                    outlined
                    input-style="font-size: 18px"
                    input-class="text-body1 text-layout-text"
                    bg-color="layout-bg"
                    label-color="layout-text"
                    ref="captchaInput"
                    color="layout-text"
                    no-error-icon
                    dark
                    class="captcha-input register-field"
                    style="max-width: 130px"
                    mask="AAAAA"
                    :disable="state.loading"
                  />
                </div>
              </div>
              <q-btn
                size="lg"
                class="full-width q-mt-lg register-button"
                label="Register"
                rounded
                :loading="state.loading"
                type="submit"
                :ripple="{ early: true }"
              />
            </q-form>
          </q-card-section>
          <!-- Error message container -->
          <div class="error-space">
            <transition
              appear
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <div v-if="state.error" class="error-container">
                <div
                  ref="errorText"
                  class="text-red text-body1 text-center shake q-mx-md"
                  @animationend="handleAnimationEnd"
                >
                  {{ state.errorMessage }}
                </div>
              </div>
            </transition>
          </div>
        </q-card>
      </div>

      <div v-if="state.registerSuccessful" class="success-message fade-in-text">
        <q-card dark class="no-shadow bg-transparent register-container q-pa-md">
          <div class="text-h5 text-center text-weight-medium q-mb-sm">Successfully Registered!</div>
          <div class="text-body1 text-center q-mb-lg">
            Your account still has to be activated by an Administrator.
          </div>
          <q-btn to="/login" class="full-width register-button" rounded label="Login" size="lg" />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { QInput } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { useRegister } from 'src/api/register';

// Composables
const localStore = useLocalStore();
const { state, captchaState, register, getCaptcha, redirectIfAuthenticated } = useRegister();

// Refs
const registerDataRequired = ref({
  username: '',
  password: '',
  passwordConfirm: '',
  email: '',
});

const isPwd = ref(true);
const isPwd2 = ref(true);
const errorText = ref<HTMLElement | null>(null);
const usernameInput = ref<QInput | null>(null);
const emailInput = ref<QInput | null>(null);
const passwordInput = ref<QInput | null>(null);
const passwordConfirmInput = ref<QInput | null>(null);
const captchaInput = ref<QInput | null>(null);

const errorMap = ref({
  usernameError: false,
  emailError: false,
  passwordError: false,
  passwordConfirmError: false,
});

const checkErrorRequired = ref(true);

// Methods
const isValidUsername = async () => {
  if (usernameInput.value) {
    const val = await usernameInput.value.validate();
    errorMap.value.usernameError = val;
    testRequiredInformation();
  }
};

const isValidEmail = async () => {
  if (emailInput.value) {
    const val = await emailInput.value.validate();
    errorMap.value.emailError = val;
    testRequiredInformation();
  }
};

const isValidPassword = async () => {
  if (passwordInput.value) {
    const val = await passwordInput.value.validate();
    errorMap.value.passwordError = val;
    testRequiredInformation();
  }
};

const isValidPasswordConfirm = async () => {
  if (passwordConfirmInput.value) {
    const val = await passwordConfirmInput.value.validate();
    errorMap.value.passwordConfirmError = val;
    testRequiredInformation();
  }
};

const testRequiredInformation = () => {
  const final =
    errorMap.value.usernameError &&
    errorMap.value.emailError &&
    errorMap.value.passwordError &&
    errorMap.value.passwordConfirmError;
  checkErrorRequired.value = !final;
};

const submitRegister = async () => {
  if (checkErrorRequired.value) {
    state.error = true;
    state.errorMessage = 'Please complete all required fields correctly';
    showError();
    return;
  }

  await register(registerDataRequired.value, captchaState.value, captchaState.id);

  if (state.error) {
    showError();
  }
};

const handleAnimationEnd = (event: AnimationEvent) => {
  const target = event.target as HTMLElement;
  if (target && target.classList) {
    target.classList.remove('shake');
  }
};

const showError = () => {
  setTimeout(() => {
    if (errorText.value) {
      errorText.value.classList.add('shake');
    }
  }, 100);
};

// Lifecycle hooks
onMounted(async () => {
  redirectIfAuthenticated();
  await getCaptcha();
});
</script>

<style scoped lang="scss">
.register-container {
  backdrop-filter: blur(5px);
  border-radius: 16px;
  transition:
    transform 0.3s ease,
    width 0.3s ease;
  width: min(400px, 90vw);
  margin: 0 auto;
}

.register-field {
  transition: all 0.2s ease;
  &:focus-within {
    transform: scale(1.02);
  }
}

.register-button {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  transition: all 0.25s ease-in-out;
  box-shadow: 0 4px 10px rgba(46, 125, 50, 0.3);
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(46, 125, 50, 0.4);
  }
}

.password-toggle {
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s ease;
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

.captcha-btn {
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
  color: white;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
  }
}

.captcha-image {
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
}

.error-space {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  position: relative;
}

.error-container {
  position: absolute;
  width: 100%;
}

.success-message {
  margin-top: 2rem;
}

.shake {
  animation: horizontal-shaking 0.4s 3;
}

@keyframes horizontal-shaking {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}

.fade-in-text {
  animation: fadeIn 1.5s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.captcha-container {
  display: flex;
  flex-direction: column;
}

.captcha-controls {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.captcha-image {
  flex-grow: 1;
  border-radius: 8px;
  transition: all 0.2s ease;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
}

.captcha-input {
  width: 100%;
  max-width: 180px;
  margin-left: auto;
  margin-right: auto;
}
</style>
