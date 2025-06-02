<template>
  <q-card
    style="margin-top: 50px; z-index: 1; filter: sepia(0.3)"
    bordered
    class="bg-layout-bg text-center fullscreen items-center"
  >
    <div class="q-mt-lg">
      <div class="q-ma-md text-layout-text text-h2 text-weight-bolder">OOPS :&lpar;</div>
      <div class="q-ma-md text-layout-text text-h6 q-mt-lg">Something went wrong.</div>
      <div class="q-ma-md text-layout-text text-h6">The error was: {{ error }}</div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  errorMessage: {
    type: String,
    default: 'Unknown error',
  },
});

const error = ref(props.errorMessage);

watch(
  () => props.errorMessage,
  (newVal) => {
    error.value = newVal;
  },
);
</script>
