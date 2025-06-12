<template>
  <div
    v-if="localLoading"
    class="absolute-center"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div v-if="!localLoading && filePreviewStore.error">
    <ErrorPage :error-message="filePreviewStore.errorMessage" />
  </div>
  <div
    v-if="!localLoading && !filePreviewStore.error && filePreviewStore.isPasswordProtected"
    class="fixed-center"
  >
    <div style="width: 350px; height: 200px">
      <a class="text-body1 text-center">A Password is required to access this file.</a>
      <q-input
        :color="localStore.isDarkMode ? 'white' : 'black'"
        v-model="password"
        outlined
        label="Password"
        class="text-primary text-body1 q-mt-lg password-field"
        @keyup.enter="submitPassword"
        :type="isPwd ? 'password' : 'text'"
        input-style="font-size: 18px"
        input-class="text-body1"
        :loading="passwordLoading"
        autofocus
      >
        <template v-slot:append>
          <q-icon
            color="layout-text"
            class="password-toggle"
            :name="isPwd ? 'visibility' : 'visibility_off'"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
      <div class="row justify-center q-mt-lg">
        <q-btn
          push
          class="bg-green text-white submit-button"
          icon="done"
          size="md"
          label="Submit"
          :loading="passwordLoading"
          @click="submitPassword"
          style="width: 250px"
        />
      </div>
    </div>
  </div>
  <div
    v-if="!localLoading && !filePreviewStore.error && !filePreviewStore.isPasswordProtected"
    class="col column q-pa-md"
  >
    <q-dialog v-model="showItemInformationDialog">
      <ItemInformationDialog :prop-item="filePreviewStore.activeFile" />
    </q-dialog>
    <FilePreviewDialog />

    <div class="text-primary text-h4 text-center q-mt-lg ellipsis text-weight-bolder">
      <q-icon
        :name="getIcon(filePreviewStore.activeFile.mimeType)"
        class="q-mr-sm"
      />
      {{ filePreviewStore.activeFile.name }}
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        :label="'Download (' + filePreviewStore.activeFile.displaySize + ')'"
        icon="file_download"
        class="cursor-pointer bg-green text-white q-mt-lg"
        push
        @click="filePreviewStore.downloadFile(filePreviewStore.activeFile.id)"
        size="xl"
        style="width: 380px"
      />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        icon="visibility"
        label="Open in File Viewer"
        class="cursor-pointer bg-light-blue-6 text-white q-mt-lg"
        push
        @click="filePreviewStore.showPreview(filePreviewStore.activeFile)"
        size="xl"
        style="width: 380px"
      />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        label="File Information"
        icon="question_mark"
        class="cursor-pointer q-mt-lg bg-blue-8 text-white"
        push
        @click="showItemInformationDialog = true"
        size="xl"
        style="width: 380px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useFilePreviewStore } from 'src/stores/fileStores/filePreviewStore';
import { useLocalStore } from 'src/stores/localStore';
import ErrorPage from 'src/components/ErrorPage.vue';
import ItemInformationDialog from 'src/components/files/dialogs/ItemInformationDialog.vue';
import { getIcon } from 'src/components/files/mimeMap';
import FilePreviewDialog from 'src/components/files/preview/FilePreviewDialog.vue';

const route = useRoute();

const localStore = useLocalStore();
const filePreviewStore = useFilePreviewStore();

const localLoading = ref(false);
const passwordLoading = ref(false);
const password = ref('');
const isPwd = ref(true);
const showItemInformationDialog = ref(false);

const currentId = ref('');

async function submitPassword() {
  passwordLoading.value = true;
  await filePreviewStore.validatePassword(currentId.value, password.value);
  passwordLoading.value = false;
}

// Watch for route changes
watch(
  () => route.params.id,
  async (newId, oldId) => {
    localLoading.value = true;
    if (newId && newId !== oldId) {
      currentId.value = newId as string;
      await filePreviewStore.getFile(currentId.value);
    }
    localLoading.value = false;
  },
  { immediate: true },
);
</script>

<style scoped>
.submit-button {
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  transition: all 0.25s ease-in-out;
  box-shadow: 0 4px 10px rgba(46, 125, 50, 0.3);
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(46, 125, 50, 0.4);
  }
}

.password-toggle {
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s ease;
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

.password-field {
  transition: all 0.2s ease;
  &:focus-within {
    transform: scale(1.02);
  }
}
</style>
