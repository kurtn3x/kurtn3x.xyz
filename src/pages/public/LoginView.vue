<template>
  <q-page class="flex flex-center items-center justify-center full-width">
    <div class="column fade-in-text q-ma-xs q-mt-xl">
      <q-card class="login-container no-shadow bg-transparent" dark>
        <div
          class="q-mt-xl text3d-primary text-weight-bolder text-h3 text-center non-selectable q-mb-md"
        >
          Login
        </div>

        <q-card-section align="center">
          <q-form @submit.prevent="handleLogin" class="q-gutter-md">
            <q-input
              v-model="credentials.username"
              outlined
              label="Username"
              input-style="font-size: 18px"
              input-class="text-body1 text-layout-text"
              class="login-field"
              color="layout-text"
              label-color="layout-text"
              bg-color="layout-bg"
              no-error-icon
              dark
              :disable="localLoading"
              :rules="[(val) => (val && val.length > 0) || 'Input your Password']"
            >
              <template #prepend>
                <q-icon name="person" color="layout-text" />
              </template>
            </q-input>

            <q-input
              v-model="credentials.password"
              outlined
              label="Password"
              input-style="font-size: 18px;"
              input-class="text-body1 text-layout-text"
              :type="showPassword ? 'text' : 'password'"
              class="login-field"
              label-color="layout-text"
              bg-color="layout-bg"
              color="layout-text"
              no-error-icon
              dark
              :disable="localLoading"
              :rules="[(val) => (val && val.length > 0) || 'Input your Password']"
            >
              <template #prepend>
                <q-icon name="lock" color="layout-text" />
              </template>
              <template #append>
                <q-icon
                  color="layout-text"
                  class="password-toggle"
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-btn
              rounded
              size="lg"
              class="full-width q-mt-lg login-button"
              label="Sign In"
              :loading="localLoading"
              type="submit"
              :ripple="{ early: true }"
            />
          </q-form>
        </q-card-section>
        <div class="error-space">
          <transition-group
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <div v-if="localStore.error" key="error" class="error-container">
              <div
                ref="errorText"
                class="text-red text-body1 text-center shake q-mx-md"
                @animationend="handleAnimationEnd"
              >
                {{ localStore.errorMessage }}
              </div>
            </div>
          </transition-group>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useLocalStore } from 'src/stores/localStore';

// Composables
const localStore = useLocalStore();

// Refs
const credentials = ref({
  username: '',
  password: '',
});
const showPassword = ref(false);
const errorText = ref<HTMLElement | null>(null);
const localLoading = ref(false);

// Methods
const handleLogin = async () => {
  localLoading.value = true;
  await localStore.login(credentials.value);

  if (localStore.error) {
    setTimeout(() => {
      if (errorText.value) {
        errorText.value.classList.add('shake');
      }
    }, 100);
  }
  localLoading.value = false;
};

const handleAnimationEnd = (event: AnimationEvent) => {
  const target = event.target as HTMLElement;
  if (target && target.classList) {
    target.classList.remove('shake');
  }
};

// Lifecycle hooks
onMounted(async () => {
  await localStore.redirectIfAuthenticated();
});
</script>

<style scoped lang="scss">
.login-container {
  backdrop-filter: blur(5px);
  border-radius: 16px;
  transition: transform 0.3s ease;
  width: min(400px, 90vw);
  margin: 0 auto;
}

.login-field {
  transition: all 0.2s ease;
  &:focus-within {
    transform: scale(1.02);
  }
}

.login-button {
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
</style>
