<template>
  <q-img
    :src="filePreviewStore.activeFileInlineUrl"
    fit="scale-down"
  >
    <template v-slot:error>
      <div class="absolute-full flex flex-center text-h6 bg-transparent text-red">
        Could not load image
      </div>
    </template>
  </q-img>
</template>

<script setup lang="ts">
import { useFilePreviewStore } from 'src/stores/fileStores/filePreviewStore';

const filePreviewStore = useFilePreviewStore();
</script>
