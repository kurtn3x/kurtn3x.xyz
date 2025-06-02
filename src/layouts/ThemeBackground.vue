<template>
  <div :class="localStore.themeBackground" class="fullscreen-bg">
    <vue-particles id="tsparticles" :options="options" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
declare module '@tsparticles/vue3';
import { useLocalStore } from 'stores/localStore';

const localStore = useLocalStore();

const options = {
  fpsLimit: 60,
  particles: {
    color: { value: '#f8f0e3' },
    move: {
      attract: { enable: false, rotateX: 600, rotateY: 600 },
      bounce: false,
      direction: 'none',
      enable: true,
      out_mode: 'out',
      random: false,
      speed: 0.4,
      straight: true,
    },
    number: {
      density: { enable: true, value_area: 2000 },
      value: 300,
    },
    opacity: {
      anim: { enable: true, opacity_min: 0.3, speed: 5, sync: false },
      random: {
        enable: true,
        minimumValue: 0.4,
      },
      value: 0.7,
    },
    shape: {
      type: 'circle',
    },
    size: {
      anim: {
        enable: false,
      },
      random: false,
      value: 1,
    },
  },
  retina_detect: true,
};
</script>

<style scoped>
.fullscreen-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
