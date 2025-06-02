<template>
  <q-card
    bordered
    flat
    style="max-width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Delete Account</q-toolbar-title>
    </q-toolbar>
    <div class="q-ma-md">
      <div class="text-red text-body1 text-weight-bolder text-center">
        This will delete your account and all data associated with it.
      </div>
      <q-input
        autofocus
        v-model="deleteAccountPassword"
        :color="isDarkMode ? 'white' : 'dark'"
        label="Current Password"
        :type="isPwd ? 'password' : 'text'"
        outlined
        class="q-mt-md"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility' : 'visibility_off'"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
    </div>

    <q-separator class="q-mt-sm" />

    <q-card-actions
      align="center"
      class="q-mt-sm q-mb-sm row"
    >
      <q-btn
        v-close-popup
        push
        icon="close"
        label="Cancel"
        class="bg-red text-white col"
      />
      <q-btn
        push
        class="bg-green text-white col"
        icon="done"
        size="md"
        label="Delete"
        @click="handleDeleteAccount"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useSettingsStore } from 'src/stores/settingsStore';

// Setup composables
const localStore = useLocalStore();
const settingsStore = useSettingsStore();

// State variables
const isPwd = ref(true);
const deleteAccountPassword = ref('');

// Computed properties
const isDarkMode = computed(() => localStore.isDarkMode);

// Methods
const handleDeleteAccount = async () => {
  const successful = await settingsStore.deleteAccount(deleteAccountPassword.value);

  if (successful) {
    await localStore.clearAll();
    window.location.reload();
  }
};
</script>
