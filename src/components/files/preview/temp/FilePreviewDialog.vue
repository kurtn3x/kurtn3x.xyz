<template>
  <ItemInformationDialog
    :prop-item="item"
    :active="showItemInformationDialog"
    @close="showItemInformationDialog = false"
  />
  <q-dialog
    v-model="showDialog"
    :maximized="maximizedToggle"
    @hide="close"
    seamless
  >
    <q-card
      :style="maximizedToggle ? 'width: 100%; height: 100%;' : dialogStyle"
      class="column"
      ref="viewerWrapper"
      id="viewerWrapper"
    >
      <q-toolbar
        class="bg-layout-bg text-layout-text q-pa-none cursor-pointer"
        v-touch-pan.mouse="onPan"
        style="height: 50px"
      >
        <a class="q-ml-md text-h6 ellipsis">File: {{ item.name }}</a>
        <q-space />

        <q-btn
          flat
          stretch
          size="sm"
          icon="minimize"
          @click="
            maximizedToggle = false;
            initialHeightMinimized = true;
          "
          :disable="!maximizedToggle"
        >
          <q-tooltip v-if="maximizedToggle">Minimize</q-tooltip>
        </q-btn>
        <q-btn
          flat
          stretch
          size="sm"
          icon="crop_square"
          @click="
            maximizedToggle = true;
            dialogPos.x = 0;
            dialogPos.y = 0;
          "
          :disable="maximizedToggle"
        >
          <q-tooltip v-if="!maximizedToggle">Maximize</q-tooltip>
        </q-btn>
        <q-btn
          size="sm"
          flat
          stretch
          icon="close"
          @click="close"
          class="close"
        >
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-toolbar>

      <q-separator :color="isDarkMode ? 'white' : 'dark'" />

      <q-card-section
        class="col column q-pa-xs"
        style="min-height: 250px; min-width: 250px"
      >
        <div v-if="mimePreview.video">
          <VideoView
            :item="item"
            :password="$props.password"
          />
        </div>
        <div
          v-else-if="mimePreview.image"
          class="col column"
        >
          <ImageView
            :item="item"
            :password="$props.password"
          />
        </div>
        <div
          v-else-if="mimePreview.code"
          class="col column"
        >
          <CodeView
            :item="item"
            :password="$props.password"
          />
        </div>
        <div
          v-else-if="mimePreview.wysiwyg"
          class="col column"
        >
          <WysiwygView
            :item="item"
            :password="$props.password"
          />
        </div>
        <div
          v-else-if="mimePreview.pdf"
          class="col column"
        >
          <PdfView
            :item="item"
            :password="$props.password"
          />
        </div>
        <div v-else>
          <div class="text-h6 text-center q-mt-lg">No Preview available.</div>
          <div class="row justify-center q-mt-md">
            <q-btn
              label="Try to open as text"
              class="bg-blue text-white text-body1"
              @click="setMime('text/text')"
            />
          </div>
        </div>
      </q-card-section>
      <q-btn
        class="absolute-bottom-right row items-end"
        v-if="!maximizedToggle"
        icon="south_east"
        size="xs"
        style="overflow: hidden; background: #a8e3ff; bottom: 0px"
        v-touch-pan.mouse="onPanResize"
      />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
/*
import { computed, defineAsyncComponent, defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import ItemInformationDialog from 'components/files/dialogs/ItemInformationDialog.vue';
import { mimeMap } from 'src/components/files/mimeMap';
import type { FileNode } from 'src/types/apiTypes.ts';

const VideoView = defineAsyncComponent(() => import('src/components/files/previews/VideoView.vue'));
const WysiwygView = defineAsyncComponent(
  () => import('src/components/files/previews/WysiwygView.vue'),
);

const PdfView = defineAsyncComponent(() => import('src/components/files/previews/PdfView.vue'));
const ImageView = defineAsyncComponent(() => import('src/components/files/previews/ImageView.vue'));
const CodeView = defineAsyncComponent(() => import('src/components/files/previews/CodeView.vue'));

export default defineComponent({
  name: 'FilePreviewDialog',
  components: {
    VideoView,
    ItemInformationDialog,
    WysiwygView,
    PdfView,
    ImageView,
    CodeView,
  },

  props: {
    propItem: {
      type: {} as FileNode,
      required: true,
    },
    active: Boolean,
    password: {
      type: String,
      default: '',
    },
  },

  emits: ['close'],

  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    const item = computed(() => props.propItem);
    const showDialog = ref(props.active);
    let mobile = q.platform.is.mobile;
    if (mobile == undefined) {
      mobile = false;
    }
    return {
      mimeMap,
      mobile,
      initialHeightMinimized: ref(false),
      item,
      localStore,
      q,
      showDialog,
      maximizedToggle: ref(true),
      dialogPos: ref({
        x: 0,
        y: 0,
      }),
      dialogSize: ref({
        x: 400,
        y: 400,
      }),
      mimePreview: ref({
        video: false,
        image: false,
        pdf: false,
        text: false,
        code: false,
        wysiwyg: false,
      }),
      showItemInformationDialog: ref(false),
    };
  },

  created() {
    this.setMime(this.item.mime);
  },

  computed: {
    isDarkMode() {
      return this.localStore.isDarkMode;
    },
    dialogStyle() {
      return `
    transform: translate(${this.dialogPos.x}px, ${this.dialogPos.y}px);
    width: ${this.dialogSize.x}px;
    height: ${this.dialogSize.y}px;
    min-width: 350px;
    min-height: 400px;
    max-width: ${this.q.screen.width}px;
    max-height: ${this.q.screen.height}px;
    position: relative;
  `;
    },
  },
  watch: {
    active(newVal, oldVal) {
      this.showDialog = newVal;
    },
    'item.mime'(newVal) {
      this.setMime(newVal);
    },
  },

  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },

    // do some math so the dialog isnt allowed to leave the window
    onPan(evt: any) {
      if (this.maximizedToggle) {
        return;
      }
      const el = document.getElementById('viewerWrapper') as any;
      const bounds = el.getBoundingClientRect();
      let x;
      if (bounds.x < 0) {
        x = this.dialogPos.x - bounds.x;
      } else if (bounds.x + el.clientWidth > this.q.screen.width) {
        x = this.dialogPos.x + (this.q.screen.width - bounds.x - el.clientWidth);
      } else {
        x = this.dialogPos.x + evt.delta.x;
      }

      let y;
      if (bounds.y < 0) {
        y = this.dialogPos.y - bounds.y;
      } else if (bounds.y + el.clientHeight > this.q.screen.height) {
        y = this.dialogPos.y + (this.q.screen.height - bounds.y - el.clientHeight);
      } else {
        y = this.dialogPos.y + evt.delta.y;
      }

      this.dialogPos = {
        x: x,
        y: y,
      };
    },

    onPanResize(evt: any) {
      if (this.maximizedToggle) return;

      // Use deltas for smoother resizing
      const deltaX = evt.delta.x;
      const deltaY = evt.delta.y;

      // Update size directly without complex calculations
      this.dialogSize = {
        x: Math.max(
          400,
          Math.min(this.dialogSize.x + deltaX, window.innerWidth - this.dialogPos.x - 10),
        ),
        y: Math.max(
          400,
          Math.min(this.dialogSize.y + deltaY, window.innerHeight - this.dialogPos.y - 10),
        ),
      };
    },

    // mime: mimeType to be previewed
    // updateAvail: if the available Mimetype-Previews for the file should be updated
    // by default an Unknown Mimetype can be opened with text, code and wysiwyg
    // text or code can each be opened with mytype text or code
    // wysiwyg mime can be opened with text, code & wysiwyg
    setMime(mime: string) {
      Object.keys(this.mimePreview).forEach((v) => ((this.mimePreview as any)[v] = false));
      const mimeType = this.mimeMap.get(mime);
      if (mimeType != undefined) {
        (this.mimePreview as any)[mimeType.type] = true;
      }
    },

    downloadFile() {
      let args = '';
      if (this.$props.password != '') {
        args += '?password=' + this.$props.password + '&attachment=1';
      } else {
        args += '?attachment=1';
      }
      const url = 'https://api.kurtn3x.xyz/files/download/file/' + this.item.id + args;
      const link = document.createElement('a');
      link.setAttribute('download', '');
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  },
});
*/
</script>

<style>
.close:hover {
  background-color: rgba(255, 0, 0, 0.644);
}
#viewerWrapper {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
  position: relative;
  contain: layout size;
}

.q-btn.absolute-bottom-right {
  cursor: se-resize;
  z-index: 1000;
  width: 24px;
  height: 24px;
  padding: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  touch-action: none;
  user-select: none;
  pointer-events: auto;
}
</style>
