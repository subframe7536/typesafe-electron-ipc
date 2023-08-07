## typesafe electron ipc

auto generate typesafe ipc functions for electron

### install

```shell
npm i typesafe-electron-ipc
```
```shell
yarn add typesafe-electron-ipc
```
```shell
pnpm add typesafe-electron-ipc
```

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
      deep: fetchIpcFn<undefined, string>(),
    },
  },
  /**
   * renderer -> main
   * ipcRenderer.invoke & ipcMain.handle
   * channel: another
   */
  another: fetchIpcFn<string, string>(),
}
export type State = typeof state
```

#### preload.ts

```typescript
import { exposeIPC } from 'typesafe-electron-ipc'

exposeIPC(state)
```

#### main.ts

```typescript
import { generateTypesafeIPC } from 'typesafe-electron-ipc'

const {
  main: { ipcTest },
  clearListeners,
  channels
} = generateTypesafeIPC(state, 'main')
ipcTest.msg((_, data, num) => {
  console.log(data, num) // 'fetch from renderer' 123456
  return 'return from main'
})
```

#### renderer.ts

```typescript
import { loadIPC } from 'typesafe-electron-ipc/renderer'

const {
  renderer: { ipcTest },
  clearListeners,
  channels
} = loadIPC<typeof state>()
export async function fetch() {
  const msg = await ipcTest.msg('fetch from renderer', 123456)
  console.log(msg) // 'return from main'
}
```

### example

more usage see in [playground](./playground)

## Typesafe EventEmitter

```typescript
export type Test = {
  test: string
  version: [data:string, num:number]
  downloadUrl: [string]
}

const er = new EventEmitter() as TypedEventEmitter<Test>

er.on('version', (data, num) => { // all type safe
  console.log(data, num)
})
er.emit('version', 'emit', 123456)
```