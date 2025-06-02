<template>
  <q-card
    bordered
    style="width: 400px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Info for {{ propItem.name }}</q-toolbar-title>
    </q-toolbar>
    <div
      class="q-ma-md"
      style="line-break: anywhere"
    >
      <div class="row q-mt-md">
        <div class="col-3 text-weight-bolder">Name</div>
        <div class="col">{{ propItem.name }}</div>
      </div>
      <div class="row q-mt-md">
        <div class="col-3 text-weight-bolder">State</div>
        <div class="col">{{ propItem.state }}</div>
      </div>
      <div class="row q-mt-md">
        <div class="col-3 text-weight-bolder">Addresses</div>
        <div class="col">{{ propItem.addresses }}</div>
      </div>
      <div class="row q-mt-md">
        <div class="col-3 text-weight-bolder">Created</div>
        <div class="col">{{ propItem.created }}</div>
      </div>
      <div class="row q-mt-md">
        <div class="col-3 text-weight-bolder">Public Key</div>
        <div class="col">
          {{ propItem.clientPublicKey }}
        </div>
      </div>
    </div>

    <q-separator class="q-mt-sm" />
    <q-card-actions
      align="evenly"
      class="q-ma-sm row"
    >
      <q-btn
        v-close-popup
        push
        class="bg-green text-white"
        icon="done"
        size="md"
        label="Ok"
        style="width: 130px"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { VPNClient } from 'src/types/apiTypes';

defineProps({
  propItem: {
    type: Object as PropType<VPNClient>,
    required: true,
  },
});
</script>
