<template>
  <router-view
    class="font"
    :key="route.fullPath"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useLocalStore } from 'stores/localStore';

// Setup composables
const localStore = useLocalStore();
const route = useRoute();

// Setup theme and other initialization
onMounted(async () => {
  await localStore.fetchCsrfToken();
  await localStore.getAuthState();
});
</script>
