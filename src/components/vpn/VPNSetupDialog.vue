<template>
  <q-card
    bordered
    flat
    style="max-width: 400px; min-width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center items-center">
      <q-toolbar-title class="q-ma-sm">Setup VPN Connection</q-toolbar-title>
    </q-toolbar>
    <q-form @submit="handleCreateVPNClient">
      <div class="q-ma-md text-body1">
        <q-input
          v-model="localSetupInput.name"
          outlined
          :color="localStore.isDarkMode ? 'white' : 'black'"
          label="VPN Connection Name"
          input-style="font-size: 18px"
          input-class="text-body1"
          class="q-mt-md"
          no-error-icon
          :rules="[
            (val) => (val && val.length > 3) || 'At least 4 characters',
            (val) => (val && val.length < 17) || 'Not more than 16 characters',
            (val) => /^[a-z0-9]+$/i.test(val) || 'Only alphanumeric characters allowed.',
            (val) => /^\S+$/.test(val) || 'No spaces allowed.',
          ]"
          lazy-rules
        />
        <div class="row justify-center q-mt-sm">
          <q-checkbox
            v-model="localSetupInput.autoKeyGeneration"
            color="green"
            dense
            label="Generate Keypair automatically"
            style="width: 300px"
          />
        </div>
        <div v-if="!localSetupInput.autoKeyGeneration">
          <q-input
            v-model="localSetupInput.clientPublicKey"
            outlined
            dense
            :color="localStore.isDarkMode ? 'white' : 'black'"
            label="Public Key"
            input-style="font-size: 14px"
            input-class="text-body2"
            class="q-mt-md"
            no-error-icon
            :rules="[(val) => (val && val.length > 0) || 'Public Key is required']"
            lazy-rules
            hide-bottom-space
          />
          <q-input
            v-model="localSetupInput.clientPrivateKey"
            outlined
            dense
            :color="localStore.isDarkMode ? 'white' : 'black'"
            label="Private Key"
            input-style="font-size: 14px"
            input-class="text-body2"
            class="q-mt-md"
            no-error-icon
          />
        </div>
        <div class="row justify-center q-mt-md">
          <q-checkbox
            v-model="localSetupInput.alternativeRoute"
            color="green"
            dense
            label="Use alternative route"
            style="width: 300px"
          >
            <q-tooltip
              class="text-body1 shadow-1"
              :class="localStore.isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'"
            >
              For connection issues
            </q-tooltip>
          </q-checkbox>
        </div>
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
          label="Generate"
          type="submit"
          :loading="localLoading"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { useVPNStore } from 'stores/vpnStore';
import type { VPNSetupType } from 'src/types/localTypes';

// Define events
const emit = defineEmits(['created']);

const localStore = useLocalStore();
const vpnStore = useVPNStore();
const q = useQuasar();

const localLoading = ref(false);

// Define default values
const localSetupInput: Ref<VPNSetupType> = ref({
  clientPublicKey: '',
  clientPrivateKey: '',
  name: '',
  autoKeyGeneration: true,
  alternativeRoute: false,
});

const handleCreateVPNClient = async () => {
  localLoading.value = true;
  if (!validateForm()) {
    return; // Stop if validation fails
  }
  const connection = await vpnStore.createVPNClient(localSetupInput.value);
  if (connection) {
    emit('created', connection);
  }
  localLoading.value = false;
};

// Basic validation
function validateForm(): boolean {
  if (localSetupInput.value.name.length < 4) {
    q.notify({
      type: 'negative',
      message: 'Name must be at least 4 characters',
    });
    return false;
  }

  if (!localSetupInput.value.autoKeyGeneration && !localSetupInput.value.clientPublicKey) {
    q.notify({
      type: 'negative',
      message: 'Public key is required when not using auto generation',
    });
    return false;
  }

  return true;
}
</script>
