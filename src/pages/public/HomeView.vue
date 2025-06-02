<template>
  <q-page class="flex flex-center position-relative full-width">
    <!-- Fix the privacy policy positioning -->
    <div class="privacy-policy-container">
      <router-link to="/privacy" class="text-white privacy-link"> Privacy Policy </router-link>
    </div>

    <div class="content-container">
      <div class="text-center non-selectable text-white text-h4 text3d-primary">
        <a v-if="!localStore.isAuthenticated">Welcome!</a>
        <a v-if="localStore.isAuthenticated"> Welcome, {{ localStore.headerInfo.username }} </a>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useLocalStore } from 'stores/localStore';

const localStore = useLocalStore();
</script>

<style scoped>
.content-container {
  position: relative;
  z-index: 10;
  width: 100%;
  text-align: center;
}

.privacy-policy-container {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 20;
}

.privacy-link {
  opacity: 0.8;
  transition: opacity 0.2s ease;
  text-decoration: none;
}

.privacy-link:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>
