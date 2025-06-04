<template>
  <q-page>
    <NavigationBar />
    <ActionBar />
    <FileListHeader />
    <FileList />
    <UploadWindow />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { Dialog } from 'quasar';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';
import ActionBar from 'src/components/files/ActionBar.vue';
import FileList from 'src/components/files/FileList.vue';
import FileListHeader from 'src/components/files/FileListHeader.vue';
import NavigationBar from 'src/components/files/NavigationBar.vue';
import UploadWindow from 'src/components/files/UploadWindow.vue';

const upload = useUploadStore();

// Navigation guard for active uploads
onBeforeRouteLeave(async (to, from, next) => {
  // Check if there are active uploads
  if (upload.hasActiveUploads || upload.queuedUploads.length > 0) {
    const stats = upload.getUploadStats();

    // Show confirmation dialog
    const shouldLeave = await new Promise<boolean>((resolve) => {
      Dialog.create({
        title: 'Active Uploads',
        message: `You have ${stats.active} active uploads and ${stats.queued} queued uploads. Do you want to cancel all uploads and leave?`,
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
      upload.clearAllUploads().catch(console.error);
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
    if (upload.hasActiveUploads || upload.queuedUploads.length > 0) {
      const message = 'You have active uploads that will be canceled if you leave this page.';
      event.preventDefault();
      event.returnValue = message;
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
  upload.clearAllUploads().catch(console.error);
});
</script>
