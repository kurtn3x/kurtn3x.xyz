import { computed, ref } from 'vue';
import { Cookies, useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import { apiGet, apiPatch, apiPost } from 'src/api/apiWrapper';
import { mimeMap, type MimeType } from 'src/components/files/mimeMap';
import { useLocalStore } from '../localStore';
import type { FileNode } from 'src/types/apiTypes';

/*
This store manages a single file and its content, as well as public access
*/

// filePreviewStore.ts
export const useFilePreviewStore = defineStore('filePreview', () => {
  const localStore = useLocalStore();
  const filePreviewDialog = ref(false);
  const q = useQuasar();

  // actual file, after password/access has been validated
  const activeFile = ref({} as FileNode);
  const activeFileContent = ref('');

  const mimePreview = ref('unknown' as MimeType);

  // if the file is password protected (return code 290 has been returned by the API)
  const passwordProtected = ref(false);

  const loading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');

  const showFilePreviewDialog = computed(() => filePreviewDialog.value);
  const isPasswordProtected = computed(() => passwordProtected.value);
  const activeMimePreview = computed(() => mimePreview.value);
  const activeFileInlineUrl = computed(
    () => `https://api.kurtn3x.xyz/files/nodes/${activeFile.value.id}/download/?inline=true`,
  );

  // the state of the file preview is tracked in the store for simplicitys sake
  function getAxiosConfig() {
    return {
      withCredentials: true,
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
      },
    };
  }

  // initiator for preview inside a folder / private context (metadata exists, access is taken for granted)
  async function showPreview(file: FileNode) {
    filePreviewDialog.value = true;
    activeFile.value = file;
    setMime(activeFile.value.mimeType);
    if (mimePreview.value == 'code' || mimePreview.value == 'wysiwyg') {
      await getFileContent(activeFile.value.id);
    }
  }

  // close the store / clear everything
  function clearPreviewStore() {
    filePreviewDialog.value = false;
    loading.value = false;
    error.value = false;
    errorMessage.value = '';
  }

  async function getFile(fileId: string) {
    loading.value = true;

    if (localStore.isDebugMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // activeFile.value = getTestFileNode();
      passwordProtected.value = true;
      error.value = false;
      loading.value = false;
      return;
    }

    const apiData = await apiGet(`/files/nodes/${fileId}/`, getAxiosConfig());

    if (apiData.error === false) {
      activeFile.value = apiData.data;
      error.value = false;
    } else {
      // code 290 reserved for password protected files
      if (apiData.returnCode === 290) {
        passwordProtected.value = true;
        error.value = false;
      } else {
        error.value = true;
        errorMessage.value = apiData.errorMessage;
      }
    }

    loading.value = false;
  }

  async function getFileContent(fileId: string) {
    loading.value = true;

    if (localStore.isDebugMode) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      activeFileContent.value = 'This is a debug preview content for file ID: ' + fileId;
      error.value = false;
      loading.value = false;
      return;
    }

    const apiData = await apiGet(`/files/nodes/${fileId}/contents/`, getAxiosConfig());

    if (apiData.error === false) {
      activeFileContent.value = apiData.data.content;
      error.value = false;
    } else {
      error.value = true;
      errorMessage.value = apiData.errorMessage;
    }

    loading.value = false;
  }

  async function validatePassword(id: string, password: string) {
    const apiData = await apiPost(
      `/files/nodes/validate_password/`,
      { id: id, password: password },
      getAxiosConfig(),
    );
    if (apiData.error === false) {
      error.value = false;
      passwordProtected.value = false;
      // call getFile again
      await getFile(id);
      q.notify({
        type: 'positive',
        message: 'Password validated',
      });
      return true;
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage,
      });
      return false;
    }
  }

  function setMime(mime: string) {
    mimePreview.value = 'unknown' as MimeType;

    const mimeType = mimeMap.get(mime);
    if (mimeType) {
      mimePreview.value = mimeType.type as MimeType;
    }
  }

  async function updateFileContent(fileId: string, content: string) {
    const apiData = await apiPatch(
      `/files/nodes/${fileId}/update_contents/`,
      { content },
      getAxiosConfig(),
    );

    if (apiData.error === false) {
      activeFileContent.value = content;
      q.notify({ type: 'positive', message: 'Content saved' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
  }

  async function updateFileMimeType(fileId: string, mimeType: string) {
    const apiData = await apiPatch(`/files/nodes/${fileId}/`, { mimeType }, getAxiosConfig());

    if (apiData.error === false) {
      activeFile.value.mimeType = mimeType;
      q.notify({ type: 'positive', message: 'Syntax updated' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
  }

  function downloadFile(itemId: string) {
    const url = `https://api.kurtn3x.xyz/files/nodes/${itemId}/download/`;

    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return {
    // initiators
    showPreview,
    //
    getFile,
    getFileContent,
    clearPreviewStore,
    validatePassword,
    setMime,
    updateFileContent,
    updateFileMimeType,
    downloadFile,
    showFilePreviewDialog,
    isPasswordProtected,
    activeMimePreview,
    activeFile,
    activeFileContent,
    activeFileInlineUrl,
    loading,
    error,
    errorMessage,
  };
});
