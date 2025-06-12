<template>
  <!-- List content -->
  <div
    class="full-width full-height row justify-center"
    v-if="filesStore.fileOps.loading"
  >
    <q-spinner-dots
      color="primary"
      size="10em"
    />
  </div>

  <q-list
    v-else
    class="column col"
  >
    <q-scroll-area class="column col">
      <q-item
        class="full-width rounded-borders"
        v-if="filesStore.fileOps.newItem.show"
        style="background-color: rgba(60, 177, 60, 0.801)"
      >
        <q-item-section
          avatar
          top
        >
          <q-fab
            v-if="filesStore.fileOps.newItem.type == 'folder'"
            class="bg-layout-bg text-layout-text no-pointer-events"
            icon="folder"
            direction="down"
            round
            padding="sm"
          />
          <q-fab
            v-else
            class="bg-layout-bg text-layout-text"
            :icon="getIcon(filesStore.fileOps.newItem.mime)"
            direction="right"
            round
            padding="sm"
          >
            <template
              v-for="[key, value] in Array.from(createTypes)"
              :key="key"
            >
              <q-fab-action
                class="bg-layout-bg text-layout-text"
                @click="filesStore.fileOps.newItem.mime = key"
                :icon="value.icon"
                :label="value.name"
              />
            </template>
          </q-fab>
        </q-item-section>

        <q-item-section>
          <q-input
            dark
            outlined
            dense
            color="white"
            v-model="filesStore.fileOps.newItem.name"
            :label="`New ${filesStore.fileOps.newItem.type == 'folder' ? 'Folder' : 'File'} Name`"
            class="text-body1 q-ml-md"
            input-class="text-body2"
            clearable
            @keyup.enter="createNewItem"
            ref="newItemInput"
            hide-bottom-space
            autofocus
          />
        </q-item-section>
        <q-item-section side>
          <div class="row">
            <q-btn
              icon="done"
              class="q-ml-md bg-green text-white"
              round
              flat
              @click="createNewItem"
            />
            <q-btn
              icon="close"
              class="q-ml-md bg-red text-white"
              round
              flat
              @click="filesStore.fileOps.resetNewItem"
            />
          </div>
        </q-item-section>
      </q-item>
      <template
        v-for="(item, index) in filesStore.filter.filteredAndSortedContent"
        :key="item.id"
      >
        <!-- Folder items -->
        <q-item
          v-if="item.nodeType == 'folder'"
          ref="folderRefs"
          :id="index"
          :data-id="item.id"
          :data-type="item.nodeType"
          clickable
          @click="getFolderById(item.id)"
          class="file-item selecto-target q-pa-none"
          :class="[
            item.dragOver ? 'dragover' : '',
            item.selected ? 'selected' : '',
            item.highlight ? 'highlight' : '',
            isDropTarget(item.id) ? 'drop-target' : '',
            isDragging(item.id) ? 'is-dragging' : '',
          ]"
          draggable="true"
          @dragstart="handleDragStart($event, item)"
          @dragend="handleDragEnd"
          @dragover.prevent
          @dragenter.prevent="handleDragEnter($event, item.id)"
          @dragleave.prevent="handleDragLeave($event, item.id)"
          @drop.prevent="handleDrop($event, item.id)"
        >
          <q-popup-proxy
            context-menu
            :breakpoint="0"
            @before-show="item.highlight = true"
            @before-hide="item.highlight = false"
          >
            <RightClickMenu :prop-item="item" />
          </q-popup-proxy>

          <div class="file-item-content full-height full-width flex-center no-pointer-events">
            <!-- Checkbox -->
            <div class="file-checkbox flex-center pointer-events">
              <q-checkbox
                :modelValue="item.selected"
                dense
                color="primary"
                @update:modelValue="handleCheckboxClick(item)"
                @click.stop
              />
            </div>

            <!-- Icon -->
            <div class="file-icon">
              <q-icon
                name="folder"
                color="primary"
                size="sm"
              />
            </div>

            <!-- Filename -->
            <div class="file-name">
              <q-icon
                name="share"
                v-if="item.isShared"
                size="xs"
              />
              {{ item.name }}
            </div>

            <!-- Size - hidden on small screens -->
            <div class="file-size">-</div>

            <!-- Modified date - hidden on smaller screens -->
            <div class="file-date">
              {{ item.modified }}
            </div>

            <!-- Actions -->
            <div class="file-actions pointer-events">
              <q-btn
                icon="more_vert"
                flat
                round
                dense
                size="md"
                color="primary"
                :loading="localLoading"
                @click.prevent.stop
              >
                <q-menu>
                  <RightClickMenu :prop-item="item" />
                </q-menu>
              </q-btn>
            </div>
          </div>
        </q-item>

        <!-- File items -->
        <q-item
          v-else
          ref="fileRefs"
          :id="index"
          :data-id="item.id"
          :data-type="item.nodeType"
          clickable
          draggable="true"
          @dragstart="handleDragStart($event, item)"
          @dragend="handleDragEnd"
          @click="filesStore.preview.showPreview(item)"
          class="file-item selecto-target q-pa-none"
          :class="[
            item.selected ? 'selected' : '',
            item.highlight ? 'highlight' : '',
            isDragging(item.id) ? 'is-dragging' : '',
          ]"
        >
          <q-popup-proxy
            context-menu
            :breakpoint="0"
            @before-show="item.highlight = true"
            @before-hide="item.highlight = false"
          >
            <RightClickMenu :prop-item="item" />
          </q-popup-proxy>

          <div class="file-item-content full-height full-width flex-center no-pointer-events">
            <!-- Checkbox -->
            <div class="file-checkbox pointer-events">
              <q-checkbox
                :modelValue="item.selected"
                dense
                color="primary"
                @update:modelValue="handleCheckboxClick(item)"
                @click.stop
                class="pointer-events"
              />
            </div>

            <!-- Icon -->
            <div class="file-icon">
              <q-icon
                :name="getIcon(item.mimeType)"
                color="primary"
                size="sm"
              />
            </div>

            <!-- Filename -->
            <div class="file-name">
              <q-icon
                name="share"
                v-if="item.isShared"
                size="xs"
              />
              {{ item.name }}
            </div>

            <!-- Size - hidden on small screens -->
            <div class="file-size">
              {{ item.displaySize }}
            </div>

            <!-- Modified date - hidden on smaller screens -->
            <div class="file-date">
              {{ item.modified }}
            </div>

            <!-- Actions -->
            <div class="file-actions">
              <q-btn
                icon="more_vert"
                flat
                round
                dense
                size="md"
                class="pointer-events"
                color="primary"
                :loading="localLoading"
                @click.prevent.stop
              >
                <q-menu>
                  <RightClickMenu :prop-item="item" />
                </q-menu>
              </q-btn>
            </div>
          </div>
        </q-item>

        <q-separator class="q-ma-none" />
      </template>
      <!-- Some space at the bottom of the list -->
      <div style="height: 50px" />
    </q-scroll-area>
  </q-list>
</template>

<script setup lang="ts">
/*
When the API is updated to use a single item for files & folders, fix the selection logic to only use ids
*/
import { onMounted, reactive, ref } from 'vue';
import { useFileStore } from 'src/stores/fileStore';
import RightClickMenu from 'src/components/files/RightClickMenu.vue';
import { createTypes, getIcon } from 'src/components/files/mimeMap';
import type { FileNode } from 'src/types/apiTypes.ts';

// Store and Quasar
const filesStore = useFileStore();

// Refs for DOM elements
const folderRefs = ref<HTMLElement[]>([]);
const fileRefs = ref<HTMLElement[]>([]);
const newItemInput = ref<HTMLInputElement | null>(null);

// loading state that no other component depends on
const localLoading = ref(false);

// Define interfaces for drag state and transfer data
interface DragState {
  currentDraggedId: string | null;
  currentDraggedType: string | null;
  activeDropTargets: Set<string>;
  selectedItemsBeingDragged: boolean;
}

interface DragItemData {
  id: string;
  type: string;
}

interface DragMultipleData {
  ids: string[];
  isMultiple: boolean;
  type?: string;
}

// Drag and drop state
const dragState = reactive<DragState>({
  currentDraggedId: null,
  currentDraggedType: null,
  activeDropTargets: new Set<string>(),
  selectedItemsBeingDragged: false,
});

async function getFolderById(folderId: string) {
  await filesStore.fileOps.getFolderById(folderId, true);
}

// Track which items are being dragged
function isDragging(itemId: string): boolean {
  return (
    dragState.currentDraggedId === itemId ||
    (dragState.selectedItemsBeingDragged &&
      Array.from(filesStore.selection.selectedItems).some((item) => item.id === itemId))
  );
}

// Track which folders are potential drop targets
function isDropTarget(folderId: string): boolean {
  if (dragState.currentDraggedId === folderId) {
    return false;
  }
  if (
    dragState.selectedItemsBeingDragged &&
    Array.from(filesStore.selection.selectedItems).some((item) => item.id === folderId)
  ) {
    return false;
  }

  return dragState.activeDropTargets.has(folderId);
}

// Handle the start of a drag operation
function handleDragStart(event: DragEvent, item: FileNode): void {
  if (!event.dataTransfer) return;

  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(
    'text/plain',
    JSON.stringify({
      id: item.id,
      type: item.nodeType,
    } as DragItemData),
  );

  // Set drag image/ghost (optional)
  const dragImage = document.createElement('div');

  // If multiple items are selected and this is one of them, drag all selected items
  if (item.selected && filesStore.selection.selectedItems.size > 1) {
    dragState.selectedItemsBeingDragged = true;
    dragImage.textContent = `Moving ${filesStore.selection.selectedItems.size} items`;

    // Add all selected item IDs to the transfer data
    const selectedIds = Array.from(filesStore.selection.selectedItems).map(
      (selectedItem) => selectedItem.id,
    );
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        ids: selectedIds,
        isMultiple: true,
        type: item.nodeType,
      } as DragMultipleData),
    );
  } else {
    // Single item drag
    dragImage.textContent = `Moving ${item.name}`;
    dragState.selectedItemsBeingDragged = false;

    if (!item.selected && filesStore.selection.selectedItems.size > 0) {
      filesStore.selection.clearSelectedItems();
    }
  }

  dragImage.className = 'drag-ghost q-pa-sm bg-primary text-white rounded-borders';
  dragImage.style.maxWidth = '250px';
  dragImage.style.overflow = 'hidden';
  dragImage.style.textOverflow = 'ellipsis';
  dragImage.style.whiteSpace = 'nowrap';
  document.body.appendChild(dragImage);

  // Position the drag image off-screen initially
  dragImage.style.position = 'absolute';
  dragImage.style.top = '-1000px';

  // Use the created element as drag image
  event.dataTransfer.setDragImage(dragImage, 0, 0);

  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(dragImage);
  }, 100);

  // Update the drag state
  dragState.currentDraggedId = item.id;
  dragState.currentDraggedType = item.nodeType;
}

function handleDragEnd() {
  // Clear visual state for all items
  dragState.activeDropTargets.clear();

  // Reset the dragging state
  dragState.currentDraggedId = null;
  dragState.currentDraggedType = null;
  dragState.selectedItemsBeingDragged = false;
}

// Handle when a dragged item enters a potential drop target
function handleDragEnter(event: DragEvent, folderItemId: string): void {
  // Don't allow dropping on the item being dragged
  if (folderItemId === dragState.currentDraggedId) return;

  // Add visual indication that this is a drop target
  dragState.activeDropTargets.add(folderItemId);
}

// Handle when a dragged item leaves a potential drop target
function handleDragLeave(event: DragEvent, folderItemId: string): void {
  dragState.activeDropTargets.delete(folderItemId);
}

// Handle the actual drop
async function handleDrop(event: DragEvent, targetFolderId: string) {
  if (!event.dataTransfer) return;

  // Prevent folder dropping on itself
  if (dragState.currentDraggedId === targetFolderId) return;

  if (
    dragState.selectedItemsBeingDragged &&
    Array.from(filesStore.selection.selectedItems).some((item) => item.id === targetFolderId)
  ) {
    return;
  }

  // Get the dragged data
  const plainData = event.dataTransfer.getData('text/plain');
  const jsonData = event.dataTransfer.getData('application/json');

  try {
    localLoading.value = true;

    // Clear drag state
    dragState.currentDraggedId = null;
    dragState.currentDraggedType = null;
    dragState.selectedItemsBeingDragged = false;
    dragState.activeDropTargets.clear();

    // Handle multiple items drop (selected items)
    if (jsonData) {
      const data = JSON.parse(jsonData) as DragMultipleData;
      if (data.isMultiple && Array.isArray(data.ids)) {
        console.log(`Dropping multiple items into folder: ${targetFolderId}`);
        data.ids.forEach((id) => {
          console.log(`Item ID: ${id} -> Target Folder ID: ${targetFolderId}`);
          // Use data.type if available, otherwise fallback to a default
          filesStore.fileOps.updateParent(id, targetFolderId).catch(console.error);
        });
        return;
      }
    }

    // Handle single item drop
    if (plainData) {
      const data = JSON.parse(plainData) as DragItemData;
      console.log(`Dropping item ID: ${data.id} into folder ID: ${targetFolderId}`);
      await filesStore.fileOps.updateParent(data.id, targetFolderId);
    }
  } catch (error) {
    console.error('Error processing drop data:', error);
  } finally {
    // Clear the drag state
    filesStore.selection.clearSelectedItems();
    dragState.currentDraggedId = null;
    dragState.currentDraggedType = null;
    dragState.selectedItemsBeingDragged = false;
    dragState.activeDropTargets.clear();
    localLoading.value = false;
  }
}

// Handle checkbox clicks with the Set
function handleCheckboxClick(item: FileNode): void {
  // Toggle selected state
  item.selected = !item.selected;

  // Update the selection store
  if (item.selected) {
    filesStore.selection.selectedItems.add(item);
  } else {
    filesStore.selection.selectedItems.delete(item);
  }
}

async function createNewItem(): Promise<void> {
  localLoading.value = true;
  let creation = {
    successful: false,
    data: null as FileNode | null,
  };
  if (filesStore.fileOps.newItem.type === 'folder') {
    creation = await filesStore.fileOps.createFolder(
      filesStore.fileOps.newItem.name,
      filesStore.fileOps.rawFolderContent.id,
    );
  } else if (filesStore.fileOps.newItem.type === 'file') {
    creation = await filesStore.fileOps.createFile(
      filesStore.fileOps.newItem.name,
      filesStore.fileOps.newItem.mime,
      filesStore.fileOps.rawFolderContent.id,
    );
  }

  if (creation.successful) {
    filesStore.fileOps.resetNewItem();
  }
  localLoading.value = false;
}

// Initialize on mount
onMounted(async () => {
  await filesStore.fileOps.getRootFolder();
});
</script>

<style scoped>
.is-dragging {
  opacity: 0.5;
}

.drag-ghost {
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.file-item {
  min-height: 48px;
}

.file-checkbox {
  width: 40px;
  min-width: 40px;
}

.file-icon {
  width: 35px;
  min-width: 35px;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 100px;
}

.file-size {
  width: 115px;
  min-width: 115px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
}

.file-date {
  width: 200px;
  min-width: 200px;
  text-align: right !important;
  white-space: nowrap;
  overflow: hidden;
}

.file-actions {
  width: 50px;
  min-width: 50px;
  padding-left: 20px;
}

.file-item-content {
  display: grid;
  grid-template-columns: 40px 35px minmax(100px, 1fr) 115px 200px 50px;
  min-height: 48px;
  max-height: 48px;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
}

@media (max-width: 599px) {
  .file-item-content {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 50px;
  }

  .file-size,
  .file-date {
    display: none;
  }
}
</style>
