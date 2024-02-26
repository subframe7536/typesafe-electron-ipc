<script setup lang="ts">
import { useElectron } from 'typesafe-electron-ipc/renderer'
import HelloWorld from './components/HelloWorld.vue'
import { renderer } from './main'

renderer.on('ipcTest::back', (_, data) => {
  console.log('get data from main process:', data)
})
</script>

<template>
  <div>
    version: {{ useElectron('info') }}
  </div>
  <HelloWorld msg="Electron + Vite + Vue" />
  <div class="flex-center">
    Place static files into the <code>/public</code> folder
    <img
      style="width: 2.4em; margin-left: .4em;"
      src="/logo.svg"
      alt="Logo"
    >
  </div>
</template>

<style>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo.electron:hover {
  filter: drop-shadow(0 0 2em #9FEAF9);
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
