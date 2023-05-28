import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { renderer } from '#preload'

createApp(App)
  .mount('#app')
  .$nextTick(async () => {
    postMessage({ payload: 'removeLoading' }, '*')
    console.log(await renderer.msg('fetch from renderer'))
    renderer.front({ test: 1 })
    renderer.back((_, data) => {
      console.log(`send from main process: ${data}`)
    })
  })
