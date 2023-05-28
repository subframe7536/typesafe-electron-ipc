## typesafe electron ipc

auto generate typesafe ipc functions for electron

### usage

#### in shared

```typescript
/**
 * for type auto completion,
 * main/renderer in *IpcFn is cast to function,
 * but the real type is string
 */
const state = {
  /**
   * renderer -> main
   * ipcRenderer.invoke & ipcMain.handle
   */
  msg: fetchIpcFn<string, string>('msg'),
  /**
   * renderer -> main
   * ipcRenderer.send & ipcMain.on
   */
  front: rendererSendIpcFn<{ test: number }>('front'),
  /**
   * main -> renderer
   * ipcRenderer.on & BrowserWindow.webContents.send
   */
  back: mainSendIpcFn<boolean>('back'),
}
```

#### preload.ts

```typescript
const {
  renderer,
  clearListeners,
  channels
} = generateTypesafeIpc(state, 'renderer')
contextBridge.exposeInMainWorld('renderer', renderer)
```

#### main.ts

```typescript
const {
  main,
  clearListeners,
  channels
} = generateTypesafeIpc(state, 'main')
main.msg((_, data) => { // data: string
  console.log(data)
  console.log(channels)
  return 'return from main'
})
```

#### renderer.ts

```typescript
export async function fetch() {
  const msg = await window.renderer.msg('fetch from renderer')
  console.log(msg) // msg: string
}
```

### example

see in [playground](./playground)