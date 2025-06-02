<template>
  <div
    ref="navbarContainer"
    class="row items-center navbar-container ellipsis"
    style="height: 50px"
  >
    <!-- Home button - always visible -->
    <q-item
      clickable
      flat
      class="rounded-borders text-primary text-weight-bold text-h5 q-ml-sm nav-item"
      @click="getRootFolder"
      @drop.prevent.self.stop="handleDrop($event, navigation.navbarIndex.homeFolderId)"
      @dragenter.prevent.stop="handleDragEnter($event, navigation.navbarIndex.homeFolderId)"
      @dragleave.prevent.stop="handleDragLeave($event, navigation.navbarIndex.homeFolderId)"
      @dragover.prevent.self.stop
      :class="{
        'drop-target': isDropTarget(navigation.navbarIndex.homeFolderId),
      }"
    >
      <q-icon
        color="primary"
        name="home"
        size="sm"
        class="full-width full-height no-pointer-events"
      />
    </q-item>

    <!-- Overflow menu for hidden items -->
    <template v-if="hiddenItems.length > 0">
      <span class="text-weight-bolder text-primary">/</span>
      <q-item
        clickable
        flat
        class="rounded-borders text-primary text-weight-bold nav-item"
        style="display: inline-block"
        @dragover="overflowMenu = true"
        @dragstop="overflowMenu = false"
      >
        <a class="no-pointer-events">...</a>
        <q-menu
          v-model="overflowMenu"
          class="no-shadow"
          @mouseleave="overflowMenu = false"
        >
          <q-list
            dense
            separator
          >
            <q-item
              v-for="(item, index) in hiddenItems"
              :key="item.id"
              clickable
              class="nav-item"
              @click="navigateToItem(item, index, true)"
              @drop.prevent.self.stop="handleDrop($event, item.id)"
              @dragenter.prevent.stop="handleDragEnter($event, item.id)"
              @dragleave.prevent.stop="handleDragLeave($event, item.id)"
              @dragover.prevent.self.stop
              :class="{ 'drop-target': isDropTarget(item.id) }"
            >
              <a
                class="no-pointer-events text-body1 ellipsis"
                style="max-width: 150px"
              >
                {{ item.name }}ssssssssssssssssssssssssssssssssssssssssss
              </a>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </template>

    <!-- Visible navigation items -->
    <template
      v-for="(item, index) in visibleItems"
      :key="item.id"
    >
      <span class="text-weight-bolder text-primary">/</span>
      <q-item
        clickable
        flat
        class="rounded-borders text-primary text-weight-bold items-center nav-item"
        @click="navigateToItem(item, index, false)"
        @drop.prevent.self.stop="handleDrop($event, item.id)"
        @dragenter.prevent.stop="handleDragEnter($event, item.id)"
        @dragleave.prevent.stop="handleDragLeave($event, item.id)"
        @dragover.prevent.self.stop
        :class="{ 'drop-target': isDropTarget(item.id) }"
      >
        <a class="no-pointer-events text-body1">
          {{ item.name }}
        </a>
      </q-item>
    </template>
    <div
      class="full-width items-center"
      v-if="fileStore.fileOps.loading"
    >
      <q-spinner-dots
        color="primary"
        size="30px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useFileStore } from 'src/stores/fileStore';

// Define TypeScript interfaces for our components
interface NavItem {
  id: string;
  name: string;
}

// Define drag state interface similar to FileList
interface DragState {
  activeDropTargets: Set<string>;
}

const $q = useQuasar();
const fileStore = useFileStore();
const navigation = fileStore.navigation;

// Refs for DOM elements
const navbarContainer = ref<HTMLElement | null>(null);

// Local state
const overflowMenu = ref(false);

// Navigation state split into hidden and visible items
const visibleItems = ref<NavItem[]>([]);
const hiddenItems = ref<NavItem[]>([]);

// Drag and drop state tracking
const dragState = reactive<DragState>({
  activeDropTargets: new Set<string>(),
});

/**
 * Check if a folder is currently a drop target
 */
function isDropTarget(folderId: string): boolean {
  return dragState.activeDropTargets.has(folderId);
}

/**
 * Recalculate which items should be visible and which should be hidden
 * based on the available space in the navbar container
 */
async function recalculateVisibleItems(): Promise<void> {
  if (!navbarContainer.value || !navigation.breadcrumbItems.length) return;

  // Get all breadcrumb items except home
  const allItems = [...navigation.breadcrumbItems.slice(1)];

  // Reset state and wait for DOM update
  hiddenItems.value = [];
  visibleItems.value = [];
  await nextTick();

  const container = navbarContainer.value;
  const containerWidth = container.clientWidth;

  // Ensure we have the home button width
  const homeButton = container.querySelector('.nav-item:first-child');
  const homeButtonWidth = homeButton ? homeButton.getBoundingClientRect().width + 10 : 60;

  // Available width after accounting for home button and padding
  let availableWidth = containerWidth - homeButtonWidth - 15; // 20px for padding/buffer

  // Reserve space for ellipsis button if we have any items
  if (allItems.length > 0) {
    availableWidth -= 50; // Approximate width for "..." button
  }

  // First, measure all items
  const itemWidths = allItems.map((item) => {
    // Create a temporary element to measure
    const tempEl = document.createElement('div');
    tempEl.className = 'q-item text-body1';
    tempEl.style.position = 'absolute';
    tempEl.style.visibility = 'hidden';
    tempEl.style.whiteSpace = 'nowrap';
    tempEl.innerText = item.name;
    document.body.appendChild(tempEl);

    // Measure the element
    const rect = tempEl.getBoundingClientRect();
    const itemWidth = rect.width + 15; // Add padding
    const separatorWidth = 10;

    document.body.removeChild(tempEl);

    return itemWidth + separatorWidth;
  });

  // Start showing items from the end (most current folder first)
  // and work backward until we run out of space
  let totalWidth = 0;
  const itemsToShow: NavItem[] = [];

  // Always show the last/current item if there's at least one item
  if (allItems.length > 0) {
    const lastItem = allItems[allItems.length - 1]!;
    const lastItemWidth = itemWidths[allItems.length - 1]!;

    itemsToShow.push(lastItem);
    totalWidth += lastItemWidth;

    // Now try to fit as many previous items as possible, from right to left
    for (let i = allItems.length - 2; i >= 0; i--) {
      const item = allItems[i]!;
      const itemWidth = itemWidths[i]!;

      if (totalWidth + itemWidth <= availableWidth) {
        // This item fits, add it at the beginning to maintain order
        itemsToShow.unshift(item);
        totalWidth += itemWidth;
      } else {
        // No more room, all remaining items will be hidden
        break;
      }
    }
  }

  // All items that aren't shown are hidden
  const itemsToHide = allItems.filter((item) => !itemsToShow.includes(item));

  // Update the component state
  visibleItems.value = itemsToShow;
  hiddenItems.value = itemsToHide;
}

/**
 * Navigate to home folder
 */
async function getRootFolder() {
  navigation.navigateTo(-1);
  await fileStore.fileOps.getRootFolder();
}

/**
 * Navigate to a specific item in the breadcrumb
 */
async function navigateToItem(item: NavItem, index: number, isFromHidden: boolean) {
  let targetIndex: number;

  if (isFromHidden) {
    // Calculate position in the full breadcrumb
    targetIndex = hiddenItems.value.indexOf(item);
  } else {
    // Add hidden items length to get correct index in the full path
    targetIndex = hiddenItems.value.length + index;
  }

  // Navigate to the item at that index in the breadcrumb
  navigation.navigateTo(targetIndex);

  // Load the folder content using the item ID
  await fileStore.fileOps.getFolderById(item.id, false);

  // Close overflow menu if open
  overflowMenu.value = false;
}

/**
 * Handle dropping an item onto a folder in the breadcrumb
 */
async function handleDrop(event: DragEvent, folderId: string) {
  if (!event.dataTransfer) return;

  // Get the dragged data
  const plainData = event.dataTransfer.getData('text/plain');
  const jsonData = event.dataTransfer.getData('application/json');

  try {
    // Handle multiple items drop (selected items)
    if (jsonData) {
      const data = JSON.parse(jsonData);
      if (data.isMultiple && Array.isArray(data.ids)) {
        console.log(`Dropping multiple items into navbar folder: ${folderId}`);
        data.ids.forEach(async (id: string) => {
          console.log(`Item ID: ${id} -> Target Folder ID: ${folderId}`);
          // Use data.type if available, otherwise fallback to a default
          await fileStore.fileOps.updateParent(id, folderId);
        });
      }
    } else if (plainData) {
      const data = JSON.parse(plainData);
      console.log(`Dropping item ID: ${data.id} into navbar folder ID: ${folderId}`);
      await fileStore.fileOps.updateParent(data.id, folderId);
    }
  } catch (error) {
    console.error('Error processing drop data:', error);
  } finally {
    // Clear the drag state
    dragState.activeDropTargets.clear();
  }
}

/**
 * Handle dragging an item over a folder in the breadcrumb
 */
function handleDragEnter(event: DragEvent, folderId: string): void {
  // Add to active drop targets for visual feedback
  dragState.activeDropTargets.add(folderId);
}

/**
 * Handle dragging an item away from a folder in the breadcrumb
 */
function handleDragLeave(event: DragEvent, folderId: string): void {
  // Remove from active drop targets for visual feedback
  dragState.activeDropTargets.delete(folderId);
}

// Watch for changes in the breadcrumb and recalculate visibility
watch(
  () => navigation.breadcrumbItems,
  async () => {
    await recalculateVisibleItems();
  },
  { deep: true },
);

// Watch for window resize to recalculate visibility
watch(
  () => $q.screen.width,
  async () => {
    await recalculateVisibleItems();
  },
);

// Initialize the component
onMounted(async () => {
  await recalculateVisibleItems();

  // Set up resize observer for more precise updates
  const resizeObserver = new ResizeObserver(() => {
    recalculateVisibleItems().catch(console.error);
  });

  if (navbarContainer.value instanceof Element) {
    resizeObserver.observe(navbarContainer.value);
  }
});
</script>

<style scoped>
.navbar-container {
  flex-wrap: nowrap !important;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.navbar-container::-webkit-scrollbar {
  display: none;
}

/* Explicitly set border to be transparent normally so it doesn't shift layout when active */
.nav-item {
  border: 2px solid transparent;
}
</style>
