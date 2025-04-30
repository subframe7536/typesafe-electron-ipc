import type { IpcSchema } from '../electron/ipc'

import { useIpcRenderer } from 'typesafe-electron-ipc/renderer'
import { createApp } from 'vue'

import { MSG } from '../electron/ipc'
import App from './App.vue'

import './style.css'

export const renderer = useIpcRenderer<IpcSchema>()

createApp(App)
  .mount('#app')
  .$nextTick(async () => {
    postMessage({ payload: 'removeLoading' }, '*')
    console.log('invoke "msg":', await renderer.invoke(MSG.ipcTest.msg, 'fetch data'))
    console.log('invoke "deep":', await renderer.invoke(MSG.ipcTest.test.deep))
    console.log('invoke "another":', await renderer.invoke(MSG.another, { a: 1 }))
    renderer.send(MSG.ipcTest.front, { test: 1 }, Date.now())
    renderer.send(MSG.ipcTest.no)
  })
