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
import FileList from 'src/components/files/FileList.vue';
import FileListHeader from 'src/components/files/FileListHeader.vue';
import ActionBar from 'src/components/files/ActionBar.vue';
import NavigationBar from 'src/components/files/NavigationBar.vue';
import UploadWindow from 'src/components/files/UploadWindow.vue';
</script>
