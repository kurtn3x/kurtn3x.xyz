<template>
  <q-card
    class="bg-transparent no-shadow"
    flat
    bordered
    dark
  >
    <q-toggle
      v-model="darkMode"
      label="Darkmode"
      color="layout-text"
      class="text-layout-text"
    />
    <q-separator color="layout-text" />

    <div
      class="row justify-evenly"
      style="width: 155px"
    >
      <template
        v-for="theme in themes"
        :key="theme.name"
      >
        <q-btn
          outline
          color="layout-text"
          @click="setTheme(theme.name)"
          :class="theme.preview"
          style="width: 32px"
          class="q-mt-xs q-mb-xs"
        />
      </template>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { themes } from 'components/lib/themes';

const localStore = useLocalStore();

const darkMode = computed({
  get: () => localStore.isDarkMode,
  set: () => {
    localStore.toggleDarkMode();
  },
});

const setTheme = (theme: string) => {
  localStore.setTheme(theme);
};
</script>
