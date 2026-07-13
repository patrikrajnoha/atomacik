<script setup>
import appContent from '../content/appContent.json'
</script>

<template>
  <section class="playlist-player-space">
    <h1 class="visually-hidden">{{ appContent.appShell.music.title }}</h1>
  </section>
</template>

<style scoped>
.playlist-player-space { min-height: calc(100dvh - 160px); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
