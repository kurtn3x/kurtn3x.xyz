<template>
  <q-card
    bordered
    style="min-width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Move Items</q-toolbar-title>
    </q-toolbar>

    <div class="q-ma-sm">
      <div class="row full-width justify-between items-center q-mb-sm">
        <q-input
          :color="localStore.isDarkMode ? 'white' : 'black'"
          v-model="filter"
          dense
          outlined
          label="Search"
          class="text-primary text-body1 col-8"
        />
        <q-btn
          flat
          icon="unfold_more"
          round
          @click="expandTree"
        >
          <q-tooltip
            class="text-body1 shadow-1"
            :class="localStore.isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'"
          >
            Expand all
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          icon="unfold_less"
          round
          @click="collapseTree"
        >
          <q-tooltip
            class="text-body1 shadow-1"
            :class="localStore.isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'"
          >
            Collapse all
          </q-tooltip>
        </q-btn>
      </div>
      <q-separator />
      <q-scroll-area
        style="height: 300px"
        class="q-mt-sm q-mb-sm"
      >
        <div
          v-if="treeLoading"
          class="q-pa-md row justify-center items-center"
        >
          <q-spinner-dots
            color="primary"
            size="50px"
            class="q-mt-md q-mb-md"
          />
        </div>
        <div
          v-else-if="fileStore.fileOps.folderTree.length === 0"
          class="q-pa-md text-center text-body1 text-red"
        >
          Error loading folder tree
        </div>

        <q-tree
          v-if="!treeLoading && fileStore.fileOps.folderTree.length > 0"
          :nodes="fileStore.fileOps.folderTree"
          v-model:selected="selectedId"
          v-model:expanded="expandedItems"
          :filter="filter"
          node-key="id"
          label-key="name"
          selected-color="green"
          class="text-body2"
          no-selection-unset
          no-results-label="No folder found"
          ref="moveItemsTree"
          @update:selected="setSelectedName"
        />
      </q-scroll-area>
      <div
        class="full-width ellipsis text-weight-bolder text-body1 row items-center justify-center q-mb-sm"
      >
        <q-item
          :clickable="moveSelection"
          class="items-center bg-grey rounded-borders bg-blue-grey-7"
          style="width: 140px"
          dense
        >
          <template v-slot:default>
            <div class="row full-width q-pa-none justify-center">
              <q-item-label class="text-center full-width ellipsis q-ma-xs text-white">
                <q-icon
                  name="arrow_drop_up"
                  size="20px"
                  color="white"
                />
                {{
                  moveSelection ? `${fileStore.selection.selectedCount} Items` : props.propItem.name
                }}
              </q-item-label>
            </div>

            <q-menu
              anchor="top middle"
              v-if="moveSelection"
              self="bottom middle"
              class="no-shadow bg-blue-grey-7 text-white"
              style="width: 140px"
            >
              <q-card
                flat
                style="max-height: 250px; width: 140px"
                class="bg-blue-grey-7 text-white"
              >
                <template
                  v-for="item in fileStore.selection.selectedItems"
                  :key="item.id"
                >
                  <div class="ellipsis text-body2 q-ma-xs">
                    <q-icon :name="item.nodeType == 'folder' ? 'folder' : 'file_present'" />
                    <a class="q-ml-sm text-white">{{ item.name }}</a>
                  </div>
                  <q-separator color="white" />
                </template>
              </q-card>
            </q-menu>
          </template>
        </q-item>
        <q-icon
          name="arrow_forward"
          class="q-ml-sm q-mr-sm"
          color="green"
          size="1.5em"
        />
        <q-item
          class="items-center bg-grey rounded-borders bg-blue-grey-7"
          style="width: 140px"
          dense
        >
          <template v-slot:default>
            <div class="row full-width q-pa-none justify-center">
              <q-item-label class="text-center full-width ellipsis q-pa-xs text-white">
                {{ selectedName }}
              </q-item-label>
            </div>
          </template>
        </q-item>
      </div>

      <q-separator />

      <q-card-actions class="q-mb-sm column">
        <div class="row full-width q-mt-sm">
          <q-btn
            v-close-popup
            push
            icon="close"
            label="Cancel"
            class="bg-red text-white col q-mr-xs"
          />
          <q-btn
            push
            class="bg-green text-white col q-ml-xs"
            icon="done"
            label="Move"
            :disable="selectedId === ''"
            :loading="localLoading"
            @click="moveItems"
          />
        </div>
      </q-card-actions>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { QTree, useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { useFileStore } from 'src/stores/fileStore';
import type { FileNode } from 'src/types/apiTypes';

const moveItemsTree = ref<QTree | null>(null);

// Define props
const props = defineProps({
  // 2 modes, either move a single item
  propItem: {
    type: Object as () => FileNode,
    default: {} as FileNode,
  },
  // or move multiple items by accessing the selected items
  moveSelection: {
    type: Boolean,
    default: false,
  },
});

// Define emits
const emit = defineEmits(['updated']);

const q = useQuasar();

// Setup stores and utilities
const localStore = useLocalStore();
const fileStore = useFileStore();

const localLoading = ref(false);
const treeLoading = ref(false);

const filter = ref('');
const selectedId = ref('');
const selectedName = ref('');
const expandedItems = ref([]);

function expandTree() {
  if (moveItemsTree.value) {
    moveItemsTree.value.expandAll();
  }
}

function collapseTree() {
  if (moveItemsTree.value) {
    moveItemsTree.value.collapseAll();
  }
}

async function moveItems() {
  localLoading.value = true;

  if (selectedId.value === fileStore.fileOps.rawFolderContent.id) {
    q.notify({
      type: 'positive',
      message: 'Files are already in this folder',
    });
    return;
  }

  if (props.moveSelection) {
    const movePromises = fileStore.selection.selectedItemsArray.map(async (item) => {
      const successful = await fileStore.fileOps.updateParent(item.id, selectedId.value);

      return {
        successful,
        item,
      };
    });

    const results = await Promise.all(movePromises);
    const allSuccessful = results.every((result) => result.successful);

    // remove successfully moved items from selection, so that the move button can be clicked again if something went wrong
    results.forEach((result) => {
      if (result.successful) {
        fileStore.selection.removeSelectedItem(result.item);
      }
    });

    // close dialog if all ok
    if (allSuccessful) {
      emit('updated');
    }
  } else {
    const successful = await fileStore.fileOps.updateParent(props.propItem.id, selectedId.value);
    if (successful) {
      emit('updated');
    }
  }
  localLoading.value = false;
}

function setSelectedName() {
  const folder = moveItemsTree.value?.getNodeByKey(selectedId.value);

  if (folder) {
    selectedName.value = folder.name;
  } else {
    selectedName.value = 'Unknown folder';
  }
}

onMounted(async () => {
  treeLoading.value = true;
  await fileStore.fileOps.getFolderTree();
  treeLoading.value = false;
});
</script>
