<template>
  <!-- Setup Dialog -->
  <q-dialog v-model="setupVPNDialog">
    <VPNSetupDialog @created="showSuccessDialog" />
  </q-dialog>

  <q-dialog v-model="helpVPNDialog">
    <VPNHelpDialog />
  </q-dialog>

  <!-- Success Dialog -->
  <q-dialog v-model="setupVPNDialogSuccessful" persistent>
    <VPNSetupSuccessDialog
      :connection="vpnSetupConnection"
      @open-help="helpVPNDialog = true"
      @updated="handleCreated"
    />
  </q-dialog>

  <!-- Main content -->
  <q-page class="column">
    <div class="q-ma-sm">
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">VPN Connections</q-toolbar-title>
        <div class="absolute-right row items-center q-mr-sm">
          <q-btn
            icon="refresh"
            round
            push
            size="sm"
            class="bg-green text-white q-mr-sm"
            @click="vpnStore.getConnections"
          />
          <q-btn
            icon="question_mark"
            push
            round
            class="bg-blue text-white"
            size="sm"
            @click="helpVPNDialog = true"
          />
        </div>
      </q-toolbar>

      <VPNClientList />

      <div class="row justify-center q-ma-md absolute-bottom">
        <q-btn
          push
          icon="add"
          active-icon="add"
          direction="up"
          color="green"
          round
          size="lg"
          @click="setupVPNDialog = !setupVPNDialog"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { VPNConnection } from 'src/types/apiTypes.ts';
import VPNSetupDialog from 'src/components/vpn/VPNSetupDialog.vue';
import VPNSetupSuccessDialog from 'src/components/vpn/VPNSetupSuccessDialog.vue';
import VPNHelpDialog from 'src/components/vpn/VPNHelpDialog.vue';
import VPNClientList from 'src/components/vpn/VPNClientList.vue';

import { useVPNStore } from 'src/stores/vpnStore';

const vpnStore = useVPNStore();

const helpVPNDialog = ref(false);
const setupVPNDialog = ref(false);
const setupVPNDialogSuccessful = ref(false);

const vpnSetupConnection = ref({}) as Ref<VPNConnection>;

// Wrapper function for creating a VPN connection that handles the UI state

async function handleCreated() {
  setupVPNDialogSuccessful.value = false;
  await vpnStore.getConnections();
}

function showSuccessDialog(connection: VPNConnection) {
  setupVPNDialog.value = false;
  vpnSetupConnection.value = connection;
  setupVPNDialogSuccessful.value = true;
}
</script>
