<template>
  <q-card bordered>
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Delete Items</q-toolbar-title>
    </q-toolbar>
    <div class="text-body1 text-center q-ma-md text-red text-weight-bolder">
      All selected Items will be deleted.
    </div>
    <div class="row justify-center q-ma-md">
      <q-item
        clickable
        class="items-center bg-grey rounded-borders bg-blue-grey-7 full-width"
        dense
        style="width: 270px"
      >
        <template v-slot:default>
          <div class="row full-width q-pa-none justify-center">
            <q-item-label class="text-center full-width ellipsis q-ma-xs text-white">
              <q-icon
                name="arrow_drop_down"
                size="20px"
                color="white"
              />
              {{ `${fileStore.selection.selectedCount} Items` }}
            </q-item-label>
          </div>

          <q-menu
            anchor="bottom middle"
            self="top middle"
            class="no-shadow bg-blue-grey-7 text-white"
            style="width: 270px"
          >
            <q-card
              flat
              style="max-height: 250px; width: 270px"
              class="bg-blue-grey-7 text-white"
            >
              <template
                v-for="item in fileStore.selection.selectedItems"
                :key="item.id"
              >
                <div class="ellipsis text-body2 q-ma-xs">
                  <q-icon :name="item.nodeType == 'folder' ? 'folder' : 'file_present'" />
                  <a class="q-ml-sm">{{ item.name }}</a>
                </div>
                <q-separator color="white" />
              </template>
            </q-card>
          </q-menu>
        </template>
      </q-item>
    </div>
    <q-separator />
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
        label="Delete"
        @click="deleteItems"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useFileStore } from 'src/stores/fileStore';

// Define emits
const emit = defineEmits(['updated']);

const fileStore = useFileStore();

async function deleteItems() {
  const deletePromises = fileStore.selection.selectedItemsArray.map(async (item) => {
    const successful = await fileStore.fileOps.deleteItem(item.id);
    return {
      successful,
      item,
    };
  });

  const results = await Promise.all(deletePromises);
  const allSuccessful = results.every((result) => result.successful);

  // remove successfully moved items from selection, so that the move button can be clicked again if something went wrong
  results.forEach((result) => {
    if (result.successful) {
      fileStore.selection.removeSelectedItem(result.item);
    }
  });

  // close dialog if all ok
  if (allSuccessful) {
    emit('updated');
  }
}
</script>
