<template>
  <div class="q-ma-md">
    <div class="text-h4 text-center q-mt-lg">Site Settings</div>
    <q-separator class="q-mt-md" />
    <q-card-section>
      <div class="row justify-center">
        <q-item>
          <q-item-section>
            <q-toggle
              v-model="darkMode"
              checked-icon="check"
              color="green"
              unchecked-icon="clear"
              label="Dark Mode"
              @click="darkMode"
              class="full-width text-h5"
            />
          </q-item-section>
        </q-item>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-center text-h5">Theme</div>

      <div class="row justify-center q-mt-md">
        <q-list
          bordered
          style="width: 300px"
        >
          <template
            v-for="theme in themes"
            :key="theme.name"
          >
            <q-item
              clickable
              @click="setTheme(theme.name)"
              :class="theme.preview"
            />
          </template>
        </q-list>
      </div>
    </q-card-section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { themes } from 'src/components/lib/themes';

// Setup composables
const localStore = useLocalStore();

// Methods
const setTheme = (theme: string) => {
  localStore.setTheme(theme);
};

const darkMode = computed({
  get: () => localStore.isDarkMode,
  set: () => {
    localStore.toggleDarkMode();
  },
});
</script>
