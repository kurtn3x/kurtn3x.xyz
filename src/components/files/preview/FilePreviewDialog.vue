<template>
  <q-dialog v-model="showItemInformationDialog">
    <ItemInformationDialog :prop-item="filePreviewStore.activeFile" />
  </q-dialog>
  <q-dialog
    :model-value="filePreviewStore.showFilePreviewDialog"
    maximized
    @hide="close"
    seamless
  >
    <q-card class="column">
      <q-toolbar
        class="bg-layout-bg text-layout-text q-pa-none cursor-pointer"
        style="height: 50px"
        @click="showItemInformationDialog = true"
      >
        <a class="q-ml-md text-h6 ellipsis">File: {{ filePreviewStore.activeFile.name }}</a>
        <q-space />
        <q-btn
          size="sm"
          flat
          stretch
          icon="download"
          @click.stop="filePreviewStore.downloadFile(filePreviewStore.activeFile.id)"
          class="download"
        />
        <q-btn
          size="sm"
          flat
          stretch
          icon="close"
          @click.stop="close"
          class="close"
        />
      </q-toolbar>

      <q-separator :color="localStore.isDarkMode ? 'white' : 'dark'" />

      <div v-if="filePreviewStore.activeMimePreview === 'video'">
        <VideoView :item="filePreviewStore.activeFile" />
      </div>
      <div
        v-else-if="filePreviewStore.activeMimePreview === 'image'"
        class="col column"
      >
        <ImageView :item="filePreviewStore.activeFile" />
      </div>
      <div
        v-else-if="filePreviewStore.activeMimePreview === 'code'"
        class="col column"
      >
        <CodeView />
      </div>
      <div
        v-else-if="filePreviewStore.activeMimePreview === 'wysiwyg'"
        class="col column"
      >
        <WysiwygView :item="filePreviewStore.activeFile" />
      </div>
      <div
        v-else-if="filePreviewStore.activeMimePreview === 'pdf'"
        class="col column"
      >
        <PdfView />
      </div>
      <div v-else>
        <div class="text-h6 text-center q-mt-lg">No Preview available.</div>
        <div class="row justify-center q-mt-md">
          <q-btn
            label="Try to open as text"
            class="bg-blue text-white text-body1"
            @click="filePreviewStore.setMime('text/text')"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';
import { useFilePreviewStore } from 'src/stores/fileStores/filePreviewStore';
import { useLocalStore } from 'src/stores/localStore';
import ItemInformationDialog from 'src/components/files/dialogs/ItemInformationDialog.vue';

// Async component imports
const VideoView = defineAsyncComponent(() => import('./VideoView.vue'));
const WysiwygView = defineAsyncComponent(() => import('./WysiwygView.vue'));
const PdfView = defineAsyncComponent(() => import('./PdfView.vue'));
const ImageView = defineAsyncComponent(() => import('./ImageView.vue'));
const CodeView = defineAsyncComponent(() => import('./CodeView.vue'));

const filePreviewStore = useFilePreviewStore();
const localStore = useLocalStore();
const showItemInformationDialog = ref(false);

// Methods
function close() {
  filePreviewStore.clearPreviewStore();
}
</script>

<style>
.close:hover {
  background-color: rgba(255, 0, 0, 0.644);
}

.download:hover {
  background-color: rgba(0, 255, 0, 0.644);
}

.q-btn.absolute-bottom-right {
  cursor: se-resize;
  z-index: 1000;
  width: 24px;
  height: 24px;
  padding: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  touch-action: none;
  user-select: none;
  pointer-events: auto;
}
</style>
