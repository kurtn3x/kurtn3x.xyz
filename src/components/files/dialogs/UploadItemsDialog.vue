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
              v-for="file in uploadStore.uploadPreviewList"
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
                    file.edit_name = file.name;
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
                      @click.stop="uploadStore.removeUploadEntry(file.name)"
                    />
                  </q-item-section>
                </q-item>
                <div v-if="file.edit">
                  <q-input
                    v-model="file.edit_name"
                    :rules="[(val) => !/\/|\x00/.test(val) || 'No slash or null char']"
                    dense
                    color="layout-text"
                    filled
                    autofocus
                    input-class="text-layout-text"
                    hide-bottom-space
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
                        @click="file.edit = false"
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
          <q-btn
            unelevated
            @click="triggerFileSelect"
            color="primary"
            text-color="white"
            class="rounded-borders"
            icon="insert_drive_file"
            label="Files"
          />

          <!-- Folder button // no support for mobile -->
          <q-btn
            unelevated
            @click="triggerFolderSelect"
            color="secondary"
            text-color="white"
            class="rounded-borders"
            icon="folder"
            label="Folder"
            v-if="!q.platform.is.mobile"
          />

          <!-- Hidden inputs -->
          <input
            ref="fileInput"
            type="file"
            multiple
            style="display: none"
            @change="handleFileSelect"
          />
          <input
            ref="folderInput"
            type="file"
            webkitdirectory
            multiple
            style="display: none"
            @change="handleFolderSelect"
          />
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
import { useQuasar } from 'quasar';
import { useFileOperationsStore } from 'src/stores/fileStores/fileOperationsStore';
import { useUploadStore } from 'src/stores/fileStores/uploadStore';

// Props definition

const props = defineProps({
  initialEvent: Object as () => DragEvent | undefined,
});
console.log(props);

const q = useQuasar();

// Store access
const uploadStore = useUploadStore();
const fileOps = useFileOperationsStore();

const dragover = ref(false);
const fileInput = ref<HTMLInputElement>();
const folderInput = ref<HTMLInputElement>();

// Method to start the upload process
function uploadFiles() {
  uploadStore.uploadFromPreviewList();
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

        uploadStore.addUploadEntry(validFile, 'file', fileOps.rawFolderContent.id);
      } else if (entry.isDirectory) {
        const folder = entry;
        uploadStore.addUploadEntry(folder, 'folder', fileOps.rawFolderContent.id);
      }
    }
  }
}
function triggerFileSelect() {
  fileInput.value?.click();
}

function triggerFolderSelect() {
  folderInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files) return;

  // Add files directly
  for (const file of Array.from(files)) {
    uploadStore.addUploadEntry(file, 'file', fileOps.rawFolderContent.id);
  }

  input.value = '';
}

function handleFolderSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) return;

  // Convert webkitdirectory files to a synthetic drag event
  const syntheticDragEvent = createSyntheticDragEvent(Array.from(files));

  // Use the existing drag & drop handler that already works perfectly
  handleDrop(syntheticDragEvent);

  input.value = '';
}

function createSyntheticDragEvent(files: File[]): DragEvent {
  // Group files by their root folders
  const folderMap = new Map<string, File[]>();

  for (const file of files) {
    const pathParts = file.webkitRelativePath.split('/');
    const rootFolder = pathParts[0] as string;

    if (!folderMap.has(rootFolder)) {
      folderMap.set(rootFolder, []);
    }
    folderMap.get(rootFolder)!.push(file);
  }

  // Create synthetic DataTransferItems that mimic drag & drop behavior
  const items: any[] = [];

  for (const [folderName, folderFiles] of folderMap) {
    const syntheticItem = {
      kind: 'file',
      webkitGetAsEntry: () => createSyntheticFolderEntry(folderName, folderFiles),
    };
    items.push(syntheticItem);
  }

  // @ts-expect-error - Creating synthetic FileSystemFileEntry
  const syntheticEvent = {
    dataTransfer: {
      items: items,
    },
    preventDefault: () => {},
    stopPropagation: () => {},
  } as DragEvent;

  return syntheticEvent;
}

function createSyntheticFolderEntry(folderName: string, files: File[]): object {
  let entriesRead = false;

  return {
    name: folderName,
    fullPath: `/${folderName}`,
    isFile: false,
    isDirectory: true,
    filesystem: null,

    createReader() {
      return {
        readEntries(
          successCallback: (entries: FileSystemEntry[]) => void,
          errorCallback?: (error: any) => void,
        ) {
          if (entriesRead) {
            successCallback([]);
            return;
          }

          entriesRead = true;

          try {
            const entries = createFolderStructure(files, folderName);
            successCallback(entries);
          } catch (error) {
            errorCallback?.(error);
          }
        },
      };
    },

    // Stub other methods
    getFile: () => {},
    getDirectory: () => {},
    getParent: () => {},
    remove: () => {},
    getMetadata: () => {},
    moveTo: () => {},
    copyTo: () => {},
  } as object;
}

function createFolderStructure(files: File[], rootFolderName: string): FileSystemEntry[] {
  const entries: FileSystemEntry[] = [];
  const processedPaths = new Set<string>();

  for (const file of files) {
    const pathParts = file.webkitRelativePath.split('/');

    // Skip if not in our root folder
    if (pathParts[0] !== rootFolderName) continue;

    // Get path relative to root folder
    const relativeParts = pathParts.slice(1);

    if (relativeParts.length === 0) continue;

    // Build the path step by step to create intermediate directories
    for (let i = 0; i < relativeParts.length; i++) {
      const currentPath = relativeParts.slice(0, i + 1).join('/');
      const currentName = relativeParts[i] as string;
      const fullPath = `/${rootFolderName}/${currentPath}`;

      if (processedPaths.has(currentPath)) continue;
      processedPaths.add(currentPath);

      if (i === relativeParts.length - 1) {
        const fileEntry: FileSystemFileEntry = {
          name: currentName,
          fullPath: fullPath,
          isFile: true,
          isDirectory: false,
          // @ts-expect-error - Creating synthetic FileEntry
          filesystem: null,

          file(successCallback: (file: File) => void) {
            successCallback(file);
          },

          getParent: () => {},
          remove: () => {},
          getMetadata: () => {},
          moveTo: () => {},
          copyTo: () => {},
        };

        entries.push(fileEntry);
      } else {
        // This is a directory
        const subFolderFiles = files.filter((f) => {
          const parts = f.webkitRelativePath.split('/');
          return (
            parts.length > i + 2 &&
            parts[0] === rootFolderName &&
            parts.slice(1, i + 2).join('/') === currentPath
          );
        });

        if (subFolderFiles.length > 0) {
          const dirEntry = createSyntheticSubFolder(currentName, subFolderFiles, fullPath);
          entries.push(dirEntry);
        }
      }
    }
  }

  return entries;
}

function createSyntheticSubFolder(
  name: string,
  files: File[],
  fullPath: string,
): FileSystemDirectoryEntry {
  let entriesRead = false;
  // @ts-expect-error - Creating synthetic FolderEntry
  return {
    name,
    fullPath,
    isFile: false,
    isDirectory: true,
    filesystem: null,

    createReader() {
      return {
        readEntries(
          successCallback: (entries: FileSystemEntry[]) => void,
          errorCallback?: (error: any) => void,
        ) {
          if (entriesRead) {
            successCallback([]);
            return;
          }

          entriesRead = true;

          try {
            // Create entries for this subdirectory
            const entries: FileSystemEntry[] = [];
            const processedPaths = new Set<string>();

            for (const file of files) {
              const pathParts = file.webkitRelativePath.split('/');
              const fileName = pathParts[pathParts.length - 1] as string;

              if (!processedPaths.has(fileName)) {
                processedPaths.add(fileName);

                const fileEntry: FileSystemFileEntry = {
                  name: fileName,
                  fullPath: `${fullPath}/${fileName}`,
                  isFile: true,
                  isDirectory: false,
                  // @ts-expect-error - Creating synthetic FileEntry
                  filesystem: null,

                  file(successCallback: (file: File) => void) {
                    successCallback(file);
                  },

                  getParent: () => {},
                  remove: () => {},
                  getMetadata: () => {},
                  moveTo: () => {},
                  copyTo: () => {},
                };

                entries.push(fileEntry);
              }
            }

            successCallback(entries);
          } catch (error) {
            errorCallback?.(error);
          }
        },
      };
    },

    getFile: () => {},
    getDirectory: () => {},
    getParent: () => {},
    remove: () => {},
    getMetadata: () => {},
    moveTo: () => {},
    copyTo: () => {},
  } as FileSystemDirectoryEntry;
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
