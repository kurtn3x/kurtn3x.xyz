<template>
  <q-dialog v-model="vpnHelpDialog">
    <VPNHelpDialog />
  </q-dialog>

  <q-dialog v-model="vpnInfoDialog">
    <VPNInformationDialog :prop-item="vpnClientInfo" />
  </q-dialog>

  <q-card
    class="bg-transparent"
    bordered
    flat
  >
    <!-- Header -->
    <q-item
      dense
      class="text-weight-bold q-mt-sm q-mb-sm text-body2"
    >
      <q-item-section
        avatar
        style="min-width: 50px; max-width: 50px"
      >
        Nr.
      </q-item-section>
      <q-item-section>
        <q-item-label>Name</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>Addresses (v4, v6)</q-item-label>
      </q-item-section>
      <q-item-section
        side
        style="width: 50px"
      ></q-item-section>
    </q-item>

    <q-separator
      color="primary"
      size="2px"
    />
    <!-- Loading state -->
    <div
      class="full-width full-height row justify-center"
      v-if="vpnStore.loading"
    >
      <q-spinner-dots
        color="primary"
        size="10em"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="!vpnStore.loading && vpnStore.connections.length === 0"
      class="text-center q-mt-md text-body1 q-mb-md"
    >
      No VPN setup yet. Click the + at the bottom of the screen to set one up.
    </div>

    <!-- Connection list -->
    <div
      v-if="!vpnStore.loading && vpnStore.connections.length > 0"
      class="vpn-connection-list"
      style="overflow: auto"
    >
      <template
        v-for="(item, index) in vpnStore.connections"
        :key="item.id"
      >
        <q-item
          clickable
          @click="showVpnInfoDialog(item)"
          :class="item.selected ? 'bg-cyan-14 text-white' : ''"
        >
          <!-- Context menu -->
          <q-popup-proxy
            context-menu
            :breakpoint="0"
            @before-show="item.selected = true"
            @before-hide="item.selected = false"
            class="shadow-1"
          >
            <q-list
              separator
              bordered
            >
              <q-item
                clickable
                v-close-popup
                @click="deleteConnection(item.id)"
              >
                <q-item-section avatar>
                  <q-icon name="delete" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Delete</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                clickable
                @click="showVpnInfoDialog(item)"
              >
                <q-item-section avatar>
                  <q-icon name="info" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Information</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-popup-proxy>

          <!-- Index -->
          <q-item-section
            avatar
            style="min-width: 50px; max-width: 50px"
          >
            {{ index + 1 }}.
          </q-item-section>

          <!-- Name with state indicator -->
          <q-item-section class="text-body1">
            <q-item-label class="text-weight-bolder ellipsis">
              <q-chip
                :color="getStateColor(item.state)"
                style="width: 20px; height: 20px"
                dense
                square
              >
                <q-spinner
                  color="white"
                  v-if="
                    item.state == 'NEW' || item.state == 'DELETING' || item.state == 'PROCESSING'
                  "
                />
                <q-tooltip :class="`bg-${getStateColor(item.state)} text-white text-body2`">
                  {{ getStateLabel(item.state) }}
                </q-tooltip>
              </q-chip>
              {{ item.name }}
            </q-item-label>
          </q-item-section>

          <!-- Addresses -->
          <q-item-section class="text-body2">
            {{ item.addresses }}
          </q-item-section>

          <!-- Actions menu -->
          <q-item-section
            side
            style="width: 50px"
          >
            <q-btn
              icon="more_vert"
              flat
              round
              @click.prevent.stop
            >
              <q-menu>
                <q-list
                  separator
                  bordered
                >
                  <q-item
                    clickable
                    v-close-popup
                    @click="deleteConnection(item.id)"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Delete</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="showVpnInfoDialog(item)"
                  >
                    <q-item-section avatar>
                      <q-icon name="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Information</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
        <q-separator size="1px" />
      </template>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { onMounted, ref } from 'vue';
import { useVPNStore } from 'stores/vpnStore';
import VPNHelpDialog from 'components/vpn/VPNHelpDialog.vue';
import VPNInformationDialog from 'components/vpn/VPNInformationDialog.vue';
import type { VPNClient } from 'src/types/apiTypes.ts';

const vpnStore = useVPNStore();

const vpnHelpDialog = ref(false);
const vpnInfoDialog = ref(false);
const vpnClientInfo = ref({}) as Ref<VPNClient>;

function showVpnInfoDialog(client: VPNClient) {
  vpnClientInfo.value = client;
  vpnInfoDialog.value = true;
}

async function deleteConnection(id: string) {
  await vpnStore.deleteConnection(id);
}

// Helper functions for state indicators
function getStateColor(state: string): string {
  switch (state) {
    case 'NEW':
      return 'blue';
    case 'PROCESSING':
      return 'orange';
    case 'CREATED':
      return 'green';
    case 'FAILED':
      return 'red';
    case 'DELETING':
      return 'grey';
    default:
      return 'grey';
  }
}

function getStateLabel(state: string): string {
  switch (state) {
    case 'NEW':
      return 'Setting up...';
    case 'PROCESSING':
      return 'Setting up...';
    case 'CREATED':
      return 'Ready';
    case 'FAILED':
      return 'Failed';
    case 'DELETING':
      return 'Deleting...';
    default:
      return 'Unknown';
  }
}

// Lifecycle hooks
onMounted(async () => {
  await vpnStore.getConnections();
});
</script>

<style scoped>
.vpn-connection-list {
  max-height: calc(100vh - 240px);
}
</style>
