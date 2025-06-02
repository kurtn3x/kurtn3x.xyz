<template>
  <q-list
    padding
    class="q-pa-none"
  >
    <q-item
      clickable
      v-ripple
      class="text-body1 text-layout-text"
      to="/"
      style="height: 55px"
    >
      <q-item-section avatar>
        <q-icon name="home" />
      </q-item-section>
      <q-item-section>Home</q-item-section>
    </q-item>
    <q-separator color="layout-text" />

    <q-item
      clickable
      v-ripple
      class="text-body1 text-layout-text"
      to="/dashboard/files"
      style="height: 55px"
    >
      <q-item-section avatar>
        <q-icon name="folder" />
      </q-item-section>
      <q-item-section>My Files</q-item-section>
    </q-item>
    <q-separator color="layout-text" />

    <q-item
      clickable
      v-ripple
      class="text-body1 text-layout-text"
      to="/dashboard/vpn"
      style="height: 55px"
    >
      <q-item-section avatar>
        <q-icon name="cloud" />
      </q-item-section>
      <q-item-section>VPN</q-item-section>
    </q-item>
    <q-separator color="layout-text" />

    <q-item
      clickable
      v-ripple
      class="text-body1 text-layout-text"
      to="/dashboard/torrent"
      style="height: 55px"
    >
      <q-item-section avatar>
        <q-icon name="cloud_download" />
      </q-item-section>
      <q-item-section>Torrents</q-item-section>
    </q-item>
    <q-separator color="layout-text" />

    <q-item
      clickable
      v-ripple
      class="text-body1 text-layout-text"
      to="/dashboard/settings"
      style="height: 55px"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>
      <q-item-section>Settings</q-item-section>
    </q-item>
    <q-separator color="layout-text" />
  </q-list>
</template>
