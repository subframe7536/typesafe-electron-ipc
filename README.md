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
  ipcTest: {
    /**
     * renderer -> main
     * ipcRenderer.invoke & ipcMain.handle
     * channel: msg
     */
    msg: fetchIpcFn<[data: string, num: number], string>('msg'),
    /**
     * renderer -> main
     * ipcRenderer.send & ipcMain.on
     * channel: ipcTest::front
     */
    front: rendererSendIpcFn<{ test: number }>(),
    /**
     * main -> renderer
     * ipcRenderer.on & BrowserWindow.webContents.send
     * channel: ipcTest::back
     */
    back: mainSendIpcFn<boolean>(),
    test: {
      /**
       * renderer -> main
       * ipcRenderer.invoke & ipcMain.handle
       * channel: ipcTest::test::deep
       */
      deep: fetchIpcFn<string, string>(),
    },
  },
  /**
   * renderer -> main
   * ipcRenderer.invoke & ipcMain.handle
   * channel: another
   */
  another: fetchIpcFn<string, string>(),
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
  main: { ipcTest },
  clearListeners,
  channels
} = generateTypesafeIpc(state, 'main')
ipcTest.msg((_, data, num) => {
  console.log(data, num) // 'fetch from renderer' 123456
  return 'return from main'
})
```

#### renderer.ts

```typescript
export async function fetch() {
  const msg = await window.renderer.ipcTest.msg('fetch from renderer', 123456)
  console.log(msg) // 'return from main'
}
```

### example

more usage see in [playground](./playground)