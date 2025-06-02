<template>
  <q-card
    bordered
    style="width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Rename Item</q-toolbar-title>
    </q-toolbar>
    <div class="text-body1 text-center q-ma-md">
      <q-input
        :color="localStore.isDarkMode ? 'white' : 'black'"
        v-model="newName"
        dense
        outlined
        label="New Name"
        class="text-primary text-body1 col"
        style="height: 45px"
        @keyup.enter="renameFile"
        autofocus
      />
    </div>

    <q-separator class="q-mt-md" />
    <q-card-actions
      align="center"
      class="row q-mt-sm q-mb-sm"
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
        label="Rename"
        @click="renameFile"
        :disable="propItem.name === newName || newName.trim() === ''"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useFileStore } from 'src/stores/fileStore';
import type { FileNode } from 'src/types/apiTypes.ts';

// Define props
const props = defineProps({
  propItem: {
    type: Object as () => FileNode,
    required: true,
  },
});
const emit = defineEmits(['updated']);

// Setup store and Quasar
const localStore = useLocalStore();
const fileStore = useFileStore();

// Local state
const newName = ref(props.propItem.name);

// Methods
async function renameFile() {
  const successful = await fileStore.fileOps.updateName(props.propItem.id, newName.value);

  if (successful) {
    emit('updated');
  }
}
</script>
