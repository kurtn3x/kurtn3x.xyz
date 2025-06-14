import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { defineStore } from 'pinia';
import { apiDelete, apiGet, apiPatch, apiPost } from 'src/api/apiWrapper';
import { useLocalStore } from '../localStore';
import { useNavigationStore } from './navigationStore';
import { useSelectionStore } from './selectionStore';
import type { FileNode, FileNodeFolder, FolderTreeNode } from 'src/types/apiTypes';
import { isFolder } from 'src/types/apiTypes';
import {
  createMockFolderHierarchy,
  initializeMockFolderDatabase,
  mockFolderDatabase,
} from 'src/types/mockfolder';

export const useFileOperationsStore = defineStore('fileOperations', () => {
  const q = useQuasar();
  const selectionStore = useSelectionStore();
  const navigationStore = useNavigationStore();
  const localStore = useLocalStore();

  // Configuration for API requests
  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  // State
  const loading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');

  // variables
  const rawFolderContent = ref({} as FileNodeFolder);
  const folderTree = ref([] as FolderTreeNode[]);

  // variable for creating a new folder or file
  const newItem = ref({
    show: false,
    name: '',
    type: '',
    mime: 'text/code',
  });

  // Functions that get a folder
  async function getRootFolder() {
    loading.value = true;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug Mode: Loading Home Folder' });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Initialize mock database and get home folder
      const homeFolder = initializeMockFolderDatabase();
      rawFolderContent.value = homeFolder;

      navigationStore.setHomeFolderId(rawFolderContent.value.id);
      navigationStore.clearNavigation();
      selectionStore.clearSelectedItems();
      loading.value = false;
      return true;
    }

    const apiData = await apiGet('/files/nodes/root_folder/', axiosConfig);

    if (apiData.error === false) {
      rawFolderContent.value = apiData.data as FileNodeFolder;
      navigationStore.setHomeFolderId((apiData.data as FileNodeFolder).id);
      navigationStore.clearNavigation();
      selectionStore.clearSelectedItems();
      error.value = false;
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      error.value = true;
      errorMessage.value = apiData.errorMessage;
    }

    loading.value = false;
    return !apiData.error;
  }

  async function getFolderById(folderId: string, navbarAdd: boolean) {
    loading.value = true;

    if (localStore.isDebugMode) {
      q.notify({
        type: 'info',
        message: `Debug Mode: Loading Folder ${folderId}`,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get folder from mock database
      const folder = mockFolderDatabase.get(folderId);

      if (folder) {
        rawFolderContent.value = folder;
        if (navbarAdd === true) {
          navigationStore.addNavbarItem({
            name: folder.name,
            id: folder.id,
          });
        }
        selectionStore.clearSelectedItems();
        loading.value = false;
        return true;
      } else {
        q.notify({
          type: 'negative',
          message: 'Folder not found in mock database',
        });
        loading.value = false;
        return false;
      }
    }

    const apiData = await apiGet(`/files/nodes/${folderId}/`, axiosConfig);

    if (apiData.error === false) {
      rawFolderContent.value = apiData.data as FileNodeFolder;
      if (navbarAdd === true) {
        navigationStore.addNavbarItem({
          name: rawFolderContent.value.name,
          id: rawFolderContent.value.id,
        });
      }
      selectionStore.clearSelectedItems();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    loading.value = false;
    return !apiData.error;
  }

  async function refreshFolder() {
    loading.value = true;
    const apiData = await apiGet(`/files/nodes/${rawFolderContent.value.id}/`, axiosConfig);

    if (apiData.error === false) {
      rawFolderContent.value = apiData.data as FileNodeFolder;
      selectionStore.clearSelectedItems();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    loading.value = false;
    return !apiData.error;
  }

  async function getFolderTree() {
    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      folderTree.value = createMockFolderHierarchy();
      return true;
    }
    const apiData = await apiGet('/files/nodes/folder_tree/', axiosConfig);

    if (apiData.error === false) {
      folderTree.value = apiData.data as FolderTreeNode[];
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      folderTree.value = [];
    }
  }

  function downloadItem(itemId: string) {
    const url = `https://api.kurtn3x.xyz/files/nodes/${itemId}/download/`;

    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Functions that create a folder or file
  async function createFolder(name: string, parentId: string, forceRefresh = true) {
    if (!validName(name)) {
      q.notify({ type: 'negative', message: 'Invalid name' });
      return {
        successful: false,
        data: null,
      };
    }

    const apiData = await apiPost(
      '/files/nodes/',
      {
        parentId: parentId,
        name: name,
        nodeType: 'folder',
      },
      axiosConfig,
    );

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Folder created' });

      // Apply immediatly to the store
      if (rawFolderContent.value.id === parentId) {
        const tempNode = apiData.data as FileNode;
        tempNode.selected = false;
        rawFolderContent.value.children.push(tempNode);
      } else if (forceRefresh) {
        // maybe do nothing, idk this is not used
        await refreshFolder();
      }
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    return {
      successful: !apiData.error,
      data: apiData.data as FileNode | null,
    };
  }

  async function createFile(name: string, mime: string, parentId: string) {
    if (!validName(name)) {
      q.notify({ type: 'negative', message: 'Invalid name' });
      return {
        successful: false,
        data: null,
      };
    }

    const file = new File([''], name);
    const formData = new FormData();

    // this was snake case before, check if this works
    formData.append('file_content', file);
    formData.append('node_type', 'file');
    formData.append('parent_id', parentId);
    formData.append('name', name);
    formData.append('mime_type', mime);
    formData.append('size_bytes', '0');

    const apiData = await apiPost('/files/nodes/', formData, axiosConfig);

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'File created' });

      if (rawFolderContent.value.id === parentId) {
        // Apply immediatly to the store
        const tempNode = apiData.data as FileNode;
        tempNode.selected = false;
        rawFolderContent.value.children.push(tempNode);
      } else {
        // maybe do nothing, idk this is not used
        await refreshFolder();
      }
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    return {
      successful: !apiData.error,
      data: apiData.data as FileNode | null,
    };
  }

  // Function that deletes a folder or file
  async function deleteItem(itemId: string) {
    const apiData = await apiDelete(`/files/nodes/${itemId}/`, axiosConfig);

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Item deleted' });
      deleteItemFromStore(itemId);
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    return !apiData.error;
  }

  // Functions that update an existing item
  async function updateParent(itemId: string, newParentId: string) {
    if (newParentId === itemId) {
      return false;
    }
    // other error handling is done in the backend

    const apiData = await apiPatch(
      `/files/nodes/${itemId}/`,
      { parentId: newParentId },
      axiosConfig,
    );

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Item moved successfully' });
      // this function is only called from the current context; so any parent change will move it to another context
      deleteItemFromStore(itemId);
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    return !apiData.error;
  }

  async function updateName(itemId: string, newName: string) {
    if (!validName(newName)) {
      return;
    }

    const apiData = await apiPatch(`/files/nodes/${itemId}/`, { name: newName }, axiosConfig);

    if (apiData.error === false) {
      updateItemInStore(itemId, { name: newName });
      q.notify({ type: 'positive', message: 'Sharing settings updated' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
    return !apiData.error;
  }

  async function updateSharing(
    itemId: string,
    sharingOptions: {
      isShared: boolean;
      allowPublicRead: boolean;
      allowPublicWrite: boolean;
    },
  ) {
    const apiData = await apiPatch(`/files/nodes/${itemId}/`, sharingOptions, axiosConfig);

    if (apiData.error === false) {
      updateItemInStore(itemId, {
        isShared: sharingOptions.isShared,
        allowPublicRead: sharingOptions.allowPublicRead,
        allowPublicWrite: sharingOptions.allowPublicWrite,
      });
      q.notify({ type: 'positive', message: 'Sharing settings updated' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    return !apiData.error;
  }

  async function updateSharingPassword(
    itemId: string,
    passwordOptions: {
      isPasswordProtected: boolean;
      password: string;
    },
  ) {
    const apiData = await apiPatch(`/files/nodes/${itemId}/`, passwordOptions, axiosConfig);

    if (apiData.error === false) {
      updateItemInStore(itemId, {
        isPasswordProtected: passwordOptions.isPasswordProtected,
      });
      q.notify({ type: 'positive', message: 'Password settings updated' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    return !apiData.error;
  }

  // Utilities
  function resetNewItem() {
    newItem.value = {
      show: false,
      name: '',
      type: '',
      mime: 'text/code',
    };
  }

  function validName(name: string) {
    if (name.length < 1) {
      q.notify({
        type: 'negative',
        message: 'Name must be at least 1 character long.',
      });
      return false;
    }

    // FIXME: fix this
    if (name.includes('/') || name.includes('\x00')) {
      q.notify({
        type: 'negative',
        message: 'Name contains invalid characters.',
      });
      return false;
    }

    if (rawFolderContent.value.children?.some((el: FileNode) => el.name === name)) {
      q.notify({
        type: 'negative',
        message: 'Item with same name exists in this path.',
      });
      return false;
    }

    return true;
  }

  // helpers to manipulate the items directly, so the api only has to be called on panic
  function updateItemInStore(itemId: string, updates: Partial<FileNode>) {
    if (!isFolder(rawFolderContent.value) || !rawFolderContent.value.children) {
      return false;
    }

    const index = rawFolderContent.value.children.findIndex((item) => item.id === itemId);

    if (index !== -1) {
      rawFolderContent.value.children[index] = {
        ...rawFolderContent.value.children[index],
        ...updates,
      } as (typeof rawFolderContent.value.children)[typeof index];
      return true;
    }

    return false;
  }

  function deleteItemFromStore(itemId: string) {
    if (!rawFolderContent.value.children) {
      return false;
    }

    const index = rawFolderContent.value.children.findIndex((item) => item.id === itemId);

    if (index !== -1) {
      rawFolderContent.value.children.splice(index, 1);
      return true;
    }

    return false;
  }

  return {
    // State
    loading,
    error,
    errorMessage,
    rawFolderContent,
    folderTree,
    newItem,

    // Methods
    getRootFolder,
    getFolderById,
    refreshFolder,
    getFolderTree,
    downloadItem,
    createFolder,
    createFile,
    deleteItem,
    updateParent,
    updateName,
    updateSharing,
    updateSharingPassword,
    validName,
    resetNewItem,
  };
});
