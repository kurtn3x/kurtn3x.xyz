<template>
  <q-img
    :src="src"
    fit="scale-down"
  >
    <template v-slot:error>
      <div class="absolute-full flex flex-center text-h6 bg-transparent text-red">
        Could not load image
      </div>
    </template>
  </q-img>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});

var args = '';
if (props.password != '') {
  args += '?password=' + props.password + '&attachment=0';
} else {
  args += '?attachment=0';
}

var src = ref('https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args);

watch(
  () => props.item,
  (newVal) => {
    src.value = 'https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args;
  },
  { immediate: true },
);
</script>
