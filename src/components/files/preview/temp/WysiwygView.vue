<template>
  <div
    class="absolute-full flex flex-center bg-transparent"
    v-if="loading"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div
    v-if="!loading && error"
    class="row justify-center q-mt-lg text-red text-h6"
  >
    Couldn't load Text from File.
  </div>

  <div
    v-if="!loading && !error"
    class="col column"
  >
    <div
      class="bg-layout-bg text-layout-text row rounded-borders q-pa-none"
      style="height: 45px"
    >
      <div class="col row justify-start">
        <q-btn
          icon="save"
          label="Save"
          flat
          stretch
          class="bg-green text-white"
          @click="updateContent"
          v-if="localStore.isAuthenticated"
        />
        <q-separator
          vertical
          color="layout-text"
          v-if="localStore.isAuthenticated"
        />
      </div>

      <div class="col row justify-end">
        <q-separator
          vertical
          color="white"
        />
        <q-btn
          :icon="isDarkMode ? 'dark_mode' : 'light_mode'"
          flat
          @click="isDarkMode = !isDarkMode"
        />
      </div>
    </div>

    <q-editor
      v-model="text"
      :toolbar="[
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'hr', 'link', 'custom_btn'],
        [
          {
            label: $q.lang.editor.formatting,
            icon: $q.iconSet.editor.formatting,
            list: 'no-icons',
            options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
          },
          {
            label: $q.lang.editor.fontSize,
            icon: $q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7'],
          },
          {
            label: $q.lang.editor.defaultFont,
            icon: $q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana',
            ],
          },
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: false,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify'],
          },
        ],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

        ['undo', 'redo'],
        ['viewsource', 'print'],
      ]"
      :fonts="{
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana',
      }"
      :dark="isDarkMode"
      :class="isDarkMode ? 'text-white' : 'text-dark'"
      class="col column"
      max-height="600px"
      @keydown.ctrl.s.prevent.stop="updateContent"
    />
  </div>
</template>

<script setup>
import { computed, defineProps, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { apiGet, apiPut } from 'src/api/apiWrapper';
import { useLocalStore } from 'stores/localStore';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});
const item = computed(() => props.item);

const q = useQuasar();
const localStore = useLocalStore();
var loading = ref(true);
var error = ref(false);
const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};
var isDarkMode = ref(localStore.isDarkMode);
var text = ref('');
getFileContent();

watch(
  () => props.item,
  (newVal) => {
    getFileContent();
  },
  { immediate: true },
);

function getFileContent() {
  var args = '';
  if (props.password != '') {
    args += '?password=' + props.password;
  }
  apiGet('/files/file-content/' + item.value.id + args, axiosConfig).then((apiData) => {
    if (apiData.error == false) {
      text.value = apiData.data.content;
      loading.value = false;
      error.value = false;
    } else {
      loading.value = false;
      error.value = true;
    }
  });
}
function updateContent() {
  if (!localStore.isAuthenticated) {
    return;
  }
  var data = {
    content: text.value,
  };
  apiPut('/files/file-content/' + item.value.id, data, axiosConfig).then((apiData) => {
    if (apiData.error == false) {
      q.notify({
        type: 'positive',
        message: 'Saved.',
        progress: true,
      });
      apiGet('/files/file-content/' + item.value.id + '?only_size=1', axiosConfig).then(
        (apiData) => {
          if (apiData.error == false) {
            item.value.size = apiData.data.size;
            item.value.sizeBytes = apiData.data.sizeBytes;
          } else {
            q.notify({
              type: 'negative',
              message: apiData.errorMessage,
              progress: true,
            });
          }
        },
      );
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage,
        progress: true,
      });
    }
  });
}
</script>
