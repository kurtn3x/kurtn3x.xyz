// src/stores/vpnStore.ts
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import * as wireguard from 'src/components/vpn/wireguard.js';
import { apiDelete, apiGet, apiPost } from 'src/api/apiWrapper';
import type { VPNClient, VPNConnection } from 'src/types/apiTypes';
import type { VPNSetupType } from 'src/types/localTypes';
import { getTestVpnClients, getTestVpnConnection } from 'src/types/test';
import { useLocalStore } from 'stores/localStore';

export const useVPNStore = defineStore('vpn', () => {
  const q = useQuasar();
  const localStore = useLocalStore();

  // State
  const connections = ref<VPNClient[]>([]);
  const loading = ref(true);
  const error = ref(false);
  const errorMessage = ref('');

  // HTTP config
  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  // Get all VPN connections
  const getConnections = async () => {
    loading.value = true;
    error.value = false;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      loading.value = false;
      error.value = false;
      connections.value = getTestVpnClients();
      return;
    }

    const apiData = await apiGet('/vpn/clients/', axiosConfig);
    if (apiData.error === false) {
      connections.value = apiData.data as VPNClient[];
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      error.value = true;
      errorMessage.value = apiData.errorMessage;
    }

    loading.value = false;
  };

  // Delete a VPN connection
  const deleteConnection = async (id: string) => {
    const apiData = await apiDelete(`/vpn/clients/${id}/`, axiosConfig);
    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Deleted' });
      // Set state to DELETING
      const index = connections.value.findIndex((conn) => conn.id === id);
      if (index !== -1 && connections.value[index]) {
        connections.value[index].state = 'DELETING';
      }
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
  };

  // Create a new VPN client
  const createVPNClient = async (setup: VPNSetupType): Promise<VPNConnection | null> => {
    let keys = {
      privateKey: '',
      publicKey: '',
    };

    if (setup.autoKeyGeneration === true) {
      keys = wireguard.generateKeypair();
      setup.clientPublicKey = keys.publicKey;
    }

    // Store private key but don't transmit it
    const privateKey = setup.clientPrivateKey;
    setup.clientPrivateKey = '';

    // Debug mode handling
    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const debugConnection = getTestVpnConnection();
      debugConnection.clientPrivateKey = 'omitted';
      return debugConnection;
    }

    // Make API call
    const apiData = await apiPost('/vpn/clients/', setup, axiosConfig);

    if (apiData.error === false) {
      const vpnConnection = apiData.data as VPNConnection;

      // Add the key information back
      if (setup.autoKeyGeneration === true) {
        // Use generated keys
        vpnConnection.clientPrivateKey = keys.privateKey;
        vpnConnection.clientPublicKey = keys.publicKey;
      } else {
        // Use keys from input
        vpnConnection.clientPrivateKey = privateKey;
        vpnConnection.clientPublicKey = setup.clientPublicKey;
      }
      return vpnConnection;
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      return null;
    }
  };

  return {
    // State
    connections,
    loading,
    error,
    errorMessage,

    // Actions
    getConnections,
    deleteConnection,
    createVPNClient,
  };
});
