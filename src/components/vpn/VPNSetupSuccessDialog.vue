<template>
  <q-card
    bordered
    flat
    class="full-width absolute"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">VPN Connection Data</q-toolbar-title>
      <div class="absolute-right row items-center q-mr-sm">
        <q-btn
          icon="question_mark"
          push
          class="bg-blue text-white"
          round
          size="sm"
          style="height: 15px; width: 15px"
          @click="$emit('open-help')"
        />
      </div>
    </q-toolbar>
    <q-separator
      size="1px"
      :color="localStore.isDarkMode ? 'white' : 'dark'"
    />
    <q-tabs
      inline-label
      v-model="activeTab"
      style="height: 50px"
      align="justify"
      indicator-color="transparent"
      active-color="layout-text"
      active-bg-color="primary"
    >
      <q-separator
        vertical
        size="1px"
      />
      <q-tab
        name="info"
        icon="info"
        label="Info"
      />
      <q-separator
        vertical
        size="1px"
      />
      <q-tab
        name="config"
        icon="download"
        label="Config"
      />
      <q-separator
        vertical
        size="1px"
      />
    </q-tabs>
    <q-separator size="1px" />
    <q-tab-panels
      v-model="activeTab"
      animated
      class="bg-transparent"
      style="max-height: 50vh; height: 50vh; overflow: scroll"
    >
      <q-tab-panel name="info">
        <div class="text-h6 text-weight-bold q-mb-sm">Your Keys</div>
        <q-input
          outlined
          readonly
          :model-value="connection.clientPublicKey"
          style="height: 50px"
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          dense
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.clientPublicKey)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Public-Key:
            </a>
          </template>
        </q-input>
        <q-input
          outlined
          readonly
          :model-value="connection.clientPrivateKey"
          style="height: 50px"
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          dense
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.clientPrivateKey ? connection.clientPrivateKey : '')"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Private-Key:
            </a>
          </template>
        </q-input>
        <q-separator />
        <div class="text-h6 text-weight-bold q-mt-md q-mb-sm">Interface Configuration</div>
        <q-input
          outlined
          readonly
          :model-value="connection.addresses"
          style="height: 50px"
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          dense
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.addresses)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Addresses:
            </a>
          </template>
        </q-input>
        <q-input
          outlined
          readonly
          :model-value="connection.dnsServers"
          style="height: 50px"
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          dense
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.dnsServers)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              DNS:
            </a>
          </template>
        </q-input>
        <q-separator />
        <div class="text-h6 text-weight-bold q-mt-md q-mb-sm">Peer Configuration</div>

        <q-input
          outlined
          readonly
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          :model-value="connection.presharedKey"
          style="height: 50px"
          dense
          v-if="props.connection.presharedKey && props.connection.presharedKey.trim()"
        >
          <q-btn
            flat
            :color="localStore.isDarkMode ? 'white' : 'dark'"
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.presharedKey)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Preshared Key:
            </a>
          </template>
        </q-input>
        <q-input
          outlined
          readonly
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          :model-value="connection.serverPublicKey"
          style="height: 50px"
          dense
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.serverPublicKey)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Public Key:
            </a>
          </template>
        </q-input>
        <q-input
          outlined
          readonly
          :model-value="connection.allowedIps"
          style="height: 50px"
          dense
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          v-if="!connectionOptions.onlyInternal"
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.allowedIps)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Allowed IPs:
            </a>
          </template>
        </q-input>
        <q-input
          outlined
          readonly
          :model-value="connection.allowedIpsInternal"
          style="height: 50px"
          dense
          :color="localStore.isDarkMode ? 'white' : 'dark'"
          v-if="connectionOptions.onlyInternal"
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.allowedIpsInternal)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Allowed IPs:
            </a>
          </template>
        </q-input>
        <q-input
          outlined
          readonly
          :model-value="connection.endpoint"
          style="height: 50px"
          dense
          :color="localStore.isDarkMode ? 'white' : 'dark'"
        >
          <q-btn
            flat
            round
            icon="content_copy"
            class="absolute-right"
            size="md"
            @click="copyToClipboard(connection.endpoint)"
          />
          <template v-slot:prepend>
            <a
              style="width: 120px"
              class="text-body1"
              :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
            >
              Endpoint:
            </a>
          </template>
        </q-input>
      </q-tab-panel>
      <q-tab-panel name="config">
        <div class="q-ma-md">
          <div class="row justify-center items-center full-width">
            <q-input
              v-model="connectionOptions.configName"
              outlined
              dense
              :color="localStore.isDarkMode ? 'white' : 'black'"
              input-class="text-body1"
              class="full-width"
              no-error-icon
              suffix=".conf"
            >
              <template v-slot:before>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="localStore.isDarkMode ? 'text-white' : 'text-dark'"
                >
                  Config Name
                </a>
              </template>
            </q-input>
          </div>
        </div>
        <q-card
          bordered
          flat
        >
          <q-toolbar>
            <q-toolbar-title class="q-ma-sm">
              {{ connectionOptions.configName }}.conf
            </q-toolbar-title>
            <div class="absolute-right row items-center">
              <q-btn
                icon="content_copy"
                push
                class="bg-grey-6 text-white q-mr-sm"
                round
                @click="copyToClipboard(wireguardConfig)"
              />
              <q-btn
                icon="download"
                push
                class="bg-green text-white q-mr-sm"
                round
                style="height: 20px; width: 20px"
                @click="downloadConfiguration"
              />
            </div>
          </q-toolbar>
          <q-separator />

          <q-input
            readonly
            type="textarea"
            v-model="wireguardConfig"
            input-class="mono q-mr-sm q-ml-sm text-body1"
            input-style="resize: none; height: 150px; line-height: 1.15; font-size: 12px;"
            style="height: 160px"
            :autogrow="false"
            borderless
          />
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <q-separator class="q-mt-sm" />
    <q-card-actions
      align="center"
      class="q-mt-sm q-mb-sm"
      vertical
    >
      <div class="text-body2 text-center text-red">
        You won't be able to recover this information.
      </div>
      <q-btn
        v-close-popup
        @click="getConnections"
        push
        class="bg-green text-white q-mt-md"
        icon="done"
        size="md"
        label="Ok"
        style="width: 175px"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { copyToClipboard } from 'src/components/lib/functions';
import type { VPNConnection } from 'src/types/apiTypes';

const props = defineProps({
  connection: {
    type: Object as () => VPNConnection,
    required: true,
  },
});

const emit = defineEmits(['open-help', 'updated']);

const localStore = useLocalStore();
const activeTab = ref('info');

// Local copy of options to avoid direct modification
const connectionOptions = ref({
  onlyInternal: false,
  configName: 'vpn0',
});

// Compute dark mode from store

// Compute config
const wireguardConfig = computed(() => {
  const config = `[Interface]
PrivateKey = ${props.connection.clientPrivateKey}
Address = ${props.connection.addresses}
DNS = ${props.connection.dnsServers}

[Peer]${
    props.connection.presharedKey && props.connection.presharedKey.trim()
      ? `
PresharedKey = ${props.connection.presharedKey}`
      : ''
  }
PublicKey = ${props.connection.serverPublicKey}
AllowedIPs = ${
    connectionOptions.value.onlyInternal
      ? props.connection.allowedIpsInternal
      : props.connection.allowedIps
  }
Endpoint = ${props.connection.endpoint}`;

  return config;
});

// Download configuration
function downloadConfiguration() {
  const element = document.createElement('a');

  element.setAttribute(
    'href',
    'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(wireguardConfig.value),
  );
  element.setAttribute('download', connectionOptions.value.configName + '.conf');

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function getConnections() {
  // Emit event to parent component to refresh connections
  emit('updated');
}
</script>
