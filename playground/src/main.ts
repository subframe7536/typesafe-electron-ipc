import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { renderer } from '#preload'

createApp(App)
  .mount('#app')
  .$nextTick(async () => {
    postMessage({ payload: 'removeLoading' }, '*')
    const { ipcTest, another } = renderer
    console.log(await ipcTest.msg('fetch from renderer'))
    console.log(await ipcTest.test.deep(111))
    console.log(await another('fetch another from renderer'))
    ipcTest.front({ test: 1 })
    ipcTest.back((_, data) => {
      console.log(`send from main process: ${data}`)
    })
  })
