<template>
  <q-page class="column col">
    <UploadWindow />
    <FilePreviewDialog />

    <NavigationBar />
    <ActionBar />

    <FileListHeader />
    <q-separator inset />

    <FileList />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';
import ActionBar from 'src/components/files/ActionBar.vue';
import FileList from 'src/components/files/FileList.vue';
import FileListHeader from 'src/components/files/FileListHeader.vue';
import NavigationBar from 'src/components/files/NavigationBar.vue';
import UploadWindow from 'src/components/files/UploadWindow.vue';
import FilePreviewDialog from 'src/components/files/preview/FilePreviewDialog.vue';

const uploadStore = useUploadStore(); // Changed from 'upload' to 'uploadStore' for clarity

const q = useQuasar();

// Navigation guard for active uploads
onBeforeRouteLeave(async (to, from, next) => {
  // Check if there are active uploads
  if (uploadStore.hasActiveUploads || uploadStore.queuedUploads.length > 0) {
    const stats = uploadStore.getUploadStats();

    // Show confirmation dialog
    const shouldLeave = await new Promise<boolean>((resolve) => {
      q.dialog({
        title: 'Active Uploads',
        message: `You have ${stats.activeCount} active uploads and ${stats.queuedCount} queued uploads. Do you want to cancel all uploads and leave?`,
        cancel: {
          label: 'Stay',
          color: 'primary',
          flat: true,
        },
        ok: {
          label: 'Cancel Uploads & Leave',
          color: 'negative',
        },
        persistent: true,
      })
        .onOk(() => {
          resolve(true);
        })
        .onCancel(() => {
          resolve(false);
        });
    });

    if (shouldLeave) {
      // Clean up all uploads before leaving
      await uploadStore.clearAllUploads();
      next();
    } else {
      // Stay on current page
      next(false);
    }
  } else {
    // No active uploads, allow navigation
    next();
  }
});

// Browser beforeunload event for page refresh/close
let beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null;

onMounted(() => {
  // Add browser beforeunload handler
  beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (uploadStore.hasActiveUploads || uploadStore.queuedUploads.length > 0) {
      const message = 'You have active uploads that will be canceled if you leave this page.';
      event.preventDefault();
      return message;
    }
  };

  window.addEventListener('beforeunload', beforeUnloadHandler);
});

// Cleanup on unmount
onUnmounted(() => {
  // Remove browser beforeunload handler
  if (beforeUnloadHandler) {
    window.removeEventListener('beforeunload', beforeUnloadHandler);
    beforeUnloadHandler = null;
  }

  // Clean up uploads when component is destroyed
  uploadStore.clearAllUploads().catch(console.error);
});
</script>

<style scoped>
.no-scroll {
  overflow: hidden !important;
}

.files-layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
}

.header-area {
  grid-row: 1;
  overflow: visible;
  z-index: 1;
}

.content-area {
  grid-row: 2;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}
</style>
