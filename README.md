## typesafe electron ipc

typesafe wrapper for IPC in Electron

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

v1 rewrite all the codes to reduce the runtime part.

for older version, please install `typesafe-electron-ipc@0.6.8` and see at [v0 branch](https://github.com/subframe7536/typesafe-electron-ipc/tree/v0)

### Quick start

#### Define IpcSchema

the event name is combine the schema's object path

```typescript
import type { DefineIpcSchema, MainSend, RendererFetch, RendererSend } from 'typesafe-electron-ipc/define'

export type IpcSchema = DefineIpcSchema<{
  ipcTest: {
    msg: RendererFetch<string, string>
    front: RendererSend<[test: { test: number }, stamp: number]>
    back: MainSend<boolean>
    no: RendererSend
    test: {
      deep: RendererFetch<undefined, string>
    }
  }
  another: RendererFetch<{ a: number } | { b: string }, string>
}, '::'> // ==> chars that combine the key path, '::' by default, customable
```

#### In main

```typescript
import { app, BrowserWindow } from 'electron'
import { useIpcMain } from 'typesafe-electron-ipc'
import type { IpcSchema } from '../ipc'

const main = useIpcMain<IpcSchema>()

// all functions are typesafe
app.whenReady().then(() => {
  main.send(BrowserWindow.getAllWindows()[0], 'ipcTest::back', true),
})
main.handle('ipcTest::msg', (_, data) => {
  return 'return from main'
})
main.on('ipcTest::front', (_, data, stamp) => {
  console.log(data, stamp)
})

const clearListener = main.on('ipcTest::no', () => console.log('no parameter'))
clearListener()

main.handle('ipcTest::test::deep', () => {
  return 'deep test from main'
})
const clearHandler = main.handle('another', (_, data) => {
  console.log(data)
  return {
    msg: 'receive from main',
    data,
  }
})
clearHandler() // clear handler
```

#### In preload

```typescript
import { exposeIpcRenderer } from 'typesafe-electron-ipc'

exposeIpcRenderer()
```


#### In renderer

```typescript
import { useIpcRenderer } from 'typesafe-electron-ipc/renderer'
import type { IpcSchema } from '../ipc'

const renderer = useIpcRenderer<IpcSchema>()

// all functions are typesafe
console.log(await renderer.invoke('ipcTest::msg', 'fetch from renderer'))
console.log(await renderer.invoke('ipcTest::test::deep'))
console.log(await renderer.invoke('another', { a: 1 }))

renderer.send('ipcTest::front', { test: 1 }, Date.now())
renderer.send('ipcTest::no')

const clearListener = renderer.on('ipcTest::back', (_, data) => {
  console.log(`send from main process: ${data}`)
})
clearListener()
```

### Example

more usage see in [playground](./playground)

## Typesafe EventEmitter

```typescript
import type { TypedEventEmitter } from 'typesafe-electron-ipc'

type Test = {
  test: string
  version: [data: string, num: number]
  downloadUrl: [string]
}

const ee = new EventEmitter() as TypedEventEmitter<Test>

// all type safe
ee.on('version', (data, num) => {
  console.log(data, num)
})
ee.emit('version', 'emit', 123456)
```