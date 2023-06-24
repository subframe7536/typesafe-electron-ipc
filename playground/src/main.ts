import { createApp } from 'vue'
import './style.css'
import { loadIPC } from 'typesafe-electron-ipc/renderer'
import type { IpcModules } from '../electron/ipc'
import App from './App.vue'

createApp(App)
  .mount('#app')
  .$nextTick(async () => {
    postMessage({ payload: 'removeLoading' }, '*')
    const { ipcTest, another } = loadIPC<IpcModules>().renderer
    console.log(await ipcTest.msg('fetch from renderer'))
    console.log(await ipcTest.test.deep())
    console.log(await another({ a: 1 }))
    ipcTest.front({ test: 1 }, Date.now())
    ipcTest.back((_, data) => {
      console.log(`send from main process: ${data}`)
    })
  })
