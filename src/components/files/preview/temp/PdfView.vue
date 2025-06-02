<template>
  <q-resize-observer
    @resize="onResize"
    :debounce="250"
  />
  <q-pdfviewer
    class="col column"
    type="html5"
    :src="src"
  />
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});

const q = useQuasar();

var args = '';
if (props.password != '') {
  args += '?password=' + props.password + '&attachment=0';
} else {
  args += '?attachment=0';
}
var src = ref(
  'https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args
);

watch(
  () => props.item,
  (newVal) => {
    src.value =
      'https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args;
  },
  { immediate: true }
);

function onResize() {
  const pdfViewer = document.querySelector('.q-pdfviewer');
  const children = pdfViewer ? pdfViewer.children : [];
  Array.from(children).forEach((child) => {
    child.classList.add('column', 'col');
  });
}
</script>
