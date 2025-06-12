<template>
  <q-pdfviewer
    class="col column"
    type="html5"
    :src="filePreviewStore.activeFileInlineUrl"
  />
</template>

<script setup lang="ts">
import { useFilePreviewStore } from 'src/stores/fileStores/filePreviewStore';

const filePreviewStore = useFilePreviewStore();
</script>
