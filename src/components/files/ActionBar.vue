<template>
  <q-dialog v-model="showMoveItemsDialog">
    <MoveItemsDialog
      :move-selection="true"
      @updated="showMoveItemsDialog = false"
    />
  </q-dialog>
  <q-dialog v-model="showDeleteItemsDialog">
    <DeleteItemsDialog @updated="showDeleteItemsDialog = false" />
  </q-dialog>
  <q-dialog v-model="showUploadFilesDialog">
    <UploadItemsDialog />
  </q-dialog>
  <q-toolbar class="q-mt-sm">
    <q-checkbox
      v-model="fileStore.selection.allSelected"
      color="green"
    />

    <!-- toolbar on larger screens -->

    <div class="row full-width">
      <q-fab
        push
        icon="add"
        direction="down"
        class="q-ml-lg"
        color="light-green"
        round
        padding="none"
        style="height: 40px; width: 40px; z-index: 3"
      >
        <q-fab-action
          outline
          class="text-body1 bg-light-green"
          text-color="white"
          icon="note_add"
          label="New File"
          @click="
            fileStore.fileOps.newItem.show = true;
            fileStore.fileOps.newItem.type = 'file';
          "
          style="width: 180px; z-index: 3"
        />
        <q-fab-action
          outline
          class="text-body1 bg-light-green"
          text-color="white"
          icon="create_new_folder"
          label="New Folder"
          @click="
            fileStore.fileOps.newItem.show = true;
            fileStore.fileOps.newItem.type = 'folder';
          "
          style="width: 180px; z-index: 3"
        />
        <q-fab-action
          push
          @click="showUploadFilesDialog = true"
          icon="file_upload"
          label="Upload Files"
          class="text-body1 bg-light-green"
          text-color="white"
          style="width: 180px; z-index: 3"
          outline
        />
      </q-fab>

      <q-space />

      <q-input
        :color="localStore.isDarkMode ? 'white' : 'black'"
        v-model="fileStore.filter.filterSearch"
        input-class="text-left"
        label="Search"
        class="text-body1 col q-ml-md"
        outlined
        dense
        style="max-width: 400px"
      />

      <q-space />
      <div
        style="width: 130px"
        class="q-ml-md q-mr-sm"
      >
        <q-fab
          push
          icon="check_box"
          active-icon="expand_more"
          direction="down"
          color="cyan-14"
          :label="`${fileStore.selection.selectedCount} Selected`"
          v-if="fileStore.selection.hasSelectedItems"
          padding="none"
          style="height: 40px; width: 140px; z-index: 3"
        >
          <q-fab-action
            class="text-body1 bg-blue"
            text-color="white"
            outline
            label="Move"
            icon="trending_flat"
            @click="showMoveItemsDialog = true"
            style="width: 150px; z-index: 3"
          />
          <q-fab-action
            class="text-body1 bg-red"
            text-color="white"
            outline
            icon="close"
            label="Delete"
            @click="showDeleteItemsDialog = true"
            style="width: 150px; z-index: 3"
          />
        </q-fab>
      </div>
    </div>
  </q-toolbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFileStore } from 'src/stores/fileStore';
import { useLocalStore } from 'src/stores/localStore';
import DeleteItemsDialog from './dialogs/DeleteItemsDialog.vue';
import MoveItemsDialog from './dialogs/MoveItemsDialog.vue';
import UploadItemsDialog from './dialogs/UploadItemsDialog.vue';

const localStore = useLocalStore();
const fileStore = useFileStore();

const showMoveItemsDialog = ref(false);
const showDeleteItemsDialog = ref(false);
const showUploadFilesDialog = ref(false);
</script>
