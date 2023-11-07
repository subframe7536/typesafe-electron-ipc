import { createApp } from 'vue'
import './style.css'
import { useIpcRenderer } from 'typesafe-electron-ipc/renderer'
import type { IpcSchema } from '../electron/ipc'
import App from './App.vue'

export const renderer = useIpcRenderer<IpcSchema>()

createApp(App)
  .mount('#app')
  .$nextTick(async () => {
    postMessage({ payload: 'removeLoading' }, '*')
    console.log('invoke "msg":', await renderer.invoke('ipcTest::msg', 'fetch data'))
    console.log('invoke "deep":', await renderer.invoke('ipcTest::test::deep'))
    console.log('invoke "another":', await renderer.invoke('another', { a: 1 }))
    renderer.send('ipcTest::front', { test: 1 }, Date.now())
    renderer.send('ipcTest::no')
  })
