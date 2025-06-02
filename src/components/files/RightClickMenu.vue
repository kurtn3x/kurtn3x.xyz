<template>
  <q-dialog v-model="showItemInformationDialog">
    <ItemInformationDialog :prop-item="propItem" />
  </q-dialog>

  <q-dialog v-model="showItemLinksDialog">
    <ItemLinksDialog :prop-item="propItem" />
  </q-dialog>

  <q-dialog v-model="showRenameItemDialog">
    <RenameItemDialog
      :prop-item="propItem"
      @updated="showRenameItemDialog = false"
    />
  </q-dialog>

  <q-dialog v-model="sharingPasswordDialog">
    <SharingPasswordDialog
      :prop-item="propItem"
      @updated="sharingPasswordDialog = false"
    />
  </q-dialog>

  <q-dialog v-model="showMoveItemsDialog">
    <MoveItemsDialog
      :prop-item="propItem"
      @updated="showMoveItemsDialog = false"
    />
  </q-dialog>

  <q-list
    separator
    bordered
  >
    <q-item
      clickable
      v-close-popup
      @click="downloadItem"
    >
      <q-item-section avatar>
        <q-icon name="file_download" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Download</q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable>
      <q-item-section avatar>
        <q-icon name="share" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Share</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="keyboard_arrow_down" />
      </q-item-section>
      <q-menu
        anchor="bottom middle"
        self="top middle"
        style="width: 250px"
      >
        <q-list
          bordered
          separator
        >
          <q-item>
            <q-checkbox
              dense
              v-model="sharingOptions.isShared"
              color="green"
              label="Enable Sharing"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="propItem.isShared == true">
            <q-checkbox
              dense
              v-model="sharingOptions.allowPublicRead"
              color="green"
              label="Allow everyone to read"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="propItem.isShared == true">
            <q-checkbox
              dense
              v-model="sharingOptions.allowPublicWrite"
              color="green"
              label="Allow everyone to write"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="propItem.isShared && propItem.isPasswordProtected">
            <q-item-section>
              <q-item-label
                class="text-center text-green text-weight-bold"
                overline
                style="font-size: 13px"
              >
                Password protected
              </q-item-label>
              <div class="row full-width q-mt-xs">
                <q-btn
                  push
                  icon="lock edit"
                  class="col q-mr-sm bg-blue text-white"
                  @click="sharingPasswordDialog = true"
                />
                <q-btn
                  push
                  icon="lock close"
                  class="col q-ml-sm bg-red text-white"
                  @click="clearSharingPassword"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="propItem.isShared == true && propItem.isPasswordProtected == false">
            <q-btn
              push
              icon="lock"
              label="Set Password"
              class="full-width full-height bg-primary text-layout-text"
              @click="sharingPasswordDialog = true"
            />
          </q-item>
          <q-item v-if="propItem.isShared">
            <q-btn
              icon="link"
              label="Manage Links"
              push
              class="full-width full-height bg-green text-white"
              @click="showItemLinksDialog = true"
            />
          </q-item>
        </q-list>
      </q-menu>
    </q-item>
    <q-item
      clickable
      @click="showRenameItemDialog = true"
    >
      <q-item-section avatar>
        <q-icon name="edit" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Rename</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      clickable
      @click="showMoveItemsDialog = true"
    >
      <q-item-section avatar>
        <q-icon name="trending_flat" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Move</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      clickable
      v-close-popup
      @click="deleteItem"
    >
      <q-item-section avatar>
        <q-icon name="close" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Delete</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      clickable
      @click="showItemInformationDialog = true"
    >
      <q-item-section avatar>
        <q-icon name="info" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Information</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFileStore } from 'src/stores/fileStore';
import ItemInformationDialog from 'components/files/dialogs/ItemInformationDialog.vue';
import ItemLinksDialog from 'components/files/dialogs/ItemLinksDialog.vue';
import RenameItemDialog from 'components/files/dialogs/RenameItemDialog.vue';
import SharingPasswordDialog from 'components/files/dialogs/SharingPasswordDialog.vue';
import MoveItemsDialog from './dialogs/MoveItemsDialog.vue';
import type { FileNode } from 'src/types/apiTypes.ts';

// Define props
const props = defineProps({
  propItem: {
    type: Object as () => FileNode,
    required: true,
  },
});

// Setup store and Quasar
const filesStore = useFileStore();

const sharingPasswordDialog = ref(false);
const showItemInformationDialog = ref(false);
const showRenameItemDialog = ref(false);
const showItemLinksDialog = ref(false);
const showMoveItemsDialog = ref(false);

const sharingOptions = ref({
  isShared: props.propItem.isShared,
  allowPublicRead: props.propItem.allowPublicRead,
  allowPublicWrite: props.propItem.allowPublicWrite,
});

async function deleteItem() {
  await filesStore.fileOps.deleteItem(props.propItem.id);
}

async function clearSharingPassword() {
  await filesStore.fileOps.updateSharingPassword(props.propItem.id, {
    isPasswordProtected: false,
    sharedPassword: '',
  });
}

function downloadItem() {
  filesStore.fileOps.downloadItem(props.propItem.id);
}

async function updateSharing() {
  const successful = await filesStore.fileOps.updateSharing(
    props.propItem.id,
    sharingOptions.value,
  );

  if (!successful) {
    sharingOptions.value.isShared = props.propItem.isShared;
    sharingOptions.value.allowPublicRead = props.propItem.allowPublicRead;
    sharingOptions.value.allowPublicWrite = props.propItem.allowPublicWrite;
  }
}
</script>
