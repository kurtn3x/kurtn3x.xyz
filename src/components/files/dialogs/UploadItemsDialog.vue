<template>
  <q-card
    bordered
    style="width: 350px; height: 500px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Upload Files</q-toolbar-title>
    </q-toolbar>

    <div class="q-ma-md">
      <div
        style="border: 2px dashed lightblue; height: 290px"
        class="q-mt-md"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragenter.self="handleDragEnter"
        @dragleave.prevent="handleDragLeave"
        :class="dragover ? 'bg-blue' : ''"
      >
        <q-scroll-area
          class="row"
          style="height: 285px"
        >
          <div
            v-if="!uploadStore.hasUploads"
            class="text-center text-h6 q-mt-md no-pointer-events"
          >
            Select some Files or Folders or Drag & Drop them here.
            <q-icon
              name="ads_click"
              :size="dragover ? '100px' : '50px'"
              class="absolute-center q-mt-md no-pointer-events"
            />
          </div>

          <q-list class="q-ma-xs">
            <template
              v-for="file in uploadStore.uploadList"
              :key="file.name"
            >
              <q-card
                class="bg-primary text-layout-text q-mt-sm"
                flat
              >
                <q-item
                  dense
                  clickable
                  @click="
                    file.edit = true;
                    file.temp = file.name;
                  "
                  class="bg-primary text-layout-text"
                >
                  <q-item-section
                    avatar
                    class="q-pa-none"
                  >
                    <q-icon :name="file.type == 'file' ? 'file_present' : 'folder'" />
                  </q-item-section>
                  <q-item-section class="q-pa-none">
                    <q-item-label
                      class="ellipsis"
                      style="width: 165px"
                    >
                      {{ file.name }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      size="xs"
                      style="height: 10px"
                      icon="delete"
                      round
                      unelevated
                      outline
                      class="bg-red text-white q-ml-sm"
                      @click.stop="uploadStore.removeUploadEntry(file)"
                    />
                  </q-item-section>
                </q-item>
                <div v-if="file.edit">
                  <q-input
                    v-model="file.temp"
                    :rules="[(val) => !/\/|\x00/.test(val) || 'No slash or null char']"
                    dense
                    color="layout-text"
                    filled
                    autofocus
                    input-class="text-layout-text"
                    hide-bottom-space
                    :error="file.error"
                    @keyup.enter="uploadStore.changeFileName(file)"
                  >
                    <template v-slot:append>
                      <q-btn
                        icon="done"
                        class="bg-green text-white"
                        unelevated
                        outline
                        size="xs"
                        round
                        @click="uploadStore.changeFileName(file)"
                      />
                      <q-btn
                        icon="close"
                        class="bg-red text-white"
                        unelevated
                        outline
                        size="xs"
                        round
                        @click="
                          file.edit = false;
                          file.error = false;
                        "
                      />
                    </template>
                  </q-input>
                </div>
              </q-card>
            </template>
          </q-list>
        </q-scroll-area>
      </div>
      <div class="row justify-between q-mt-sm">
        <div class="row">
          <q-file
            unelevated
            dense
            label-slot
            multiple
            v-model="fileButtonFiles"
            @update:model-value="fileButtonChanged"
            color="white"
            class="bg-primary text-layout-text rounded-borders q-mr-md"
            label-color="white"
          >
            <template v-slot:label>
              <div class="text-body1 q-ml-sm items-center">
                <q-icon
                  name="add"
                  size="24px"
                />
                <a class="q-ml-sm">Select Files</a>
              </div>
            </template>
          </q-file>
        </div>
        <div style="height: 25px; width: 35px">
          <q-btn
            style="height: 25px; width: 35px"
            @click="uploadStore.clearUploadList"
            icon="delete"
            size="xs"
            class="bg-red text-white"
            push
            :disabled="!uploadStore.hasUploads"
          />
        </div>
      </div>
    </div>

    <q-separator class="q-mt-sm" />

    <q-card-actions
      align="evenly"
      class="q-mt-sm q-mb-sm row"
    >
      <q-btn
        v-close-popup
        push
        icon="close"
        label="Close"
        class="bg-red text-white col-4"
        style="height: 45px"
      />
      <q-btn
        :disabled="!uploadStore.hasUploads"
        v-close-popup
        push
        class="bg-green text-white col"
        icon="done"
        size="md"
        label="Upload"
        @click="uploadFiles"
        style="width: 210px; height: 45px"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';

// Props definition

const props = defineProps({
  initialEvent: Object as () => DragEvent | undefined,
});
console.log(props);

// Store access
const uploadStore = useUploadStore();

const dragover = ref(false);
const fileButtonFiles = ref<File[] | null>(null);

// Method to start the upload process
async function uploadFiles() {
  await uploadStore.startUploadFromDialog();
}

/**
 * Handle drag over event
 */
function handleDragOver(ev: DragEvent) {
  if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
    if (ev.dataTransfer.items[0]!.kind === 'file') {
      dragover.value = true;
    }
  }
}

/**
 * Handle drag enter event
 */
function handleDragEnter(ev: DragEvent) {
  if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
    if (ev.dataTransfer.items[0]!.kind === 'file') {
      dragover.value = true;
    }
  }
}

/**
 * Handle drag leave event
 */
function handleDragLeave(ev: DragEvent) {
  if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
    if (ev.dataTransfer.items[0]!.kind === 'file') {
      dragover.value = false;
    }
  }
}

function fileButtonChanged() {
  if (fileButtonFiles.value == null || fileButtonFiles.value.length === 0) return;

  for (const file of fileButtonFiles.value) {
    uploadStore.addUploadEntry(file, 'file');
  }
  fileButtonFiles.value = null;
}

function handleDrop(ev: DragEvent) {
  dragover.value = false;
  if (!ev.dataTransfer) return;

  const dropItems = Array.from(ev.dataTransfer.items);

  for (const item of dropItems) {
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry() as FileSystemEntry;

      if (!entry) continue;

      if (entry.isFile) {
        const validFile = item.getAsFile();

        if (!validFile) continue;

        uploadStore.addUploadEntry(validFile, 'file');
      } else if (entry.isDirectory) {
        const folder = entry;
        uploadStore.addUploadEntry(folder, 'folder');
      }
    }
  }
}

// Watch for external drop events (like when initialEvent is passed in)
// watch(
//   () => props.initialEvent,
//   (newVal, oldVal) => {
//     if (newVal !== undefined && newVal !== oldVal) {
//       uploadStore.uploadDialogAreaDrop(newVal as DragEvent);
//     }
//   }
// );
</script>
