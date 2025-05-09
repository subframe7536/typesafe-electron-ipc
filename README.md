## typesafe-electron-ipc

Typesafe wrapper for IPC in Electron

### Install

```sh
npm i typesafe-electron-ipc
```
```sh
yarn add typesafe-electron-ipc
```
```sh
pnpm add typesafe-electron-ipc
```

v1 rewrite all the codes to reduce the runtime part.

For older version, please install `typesafe-electron-ipc@0.6.8` and see at [v0 branch](https://github.com/subframe7536/typesafe-electron-ipc/tree/v0)

### Quick Start

#### Define IpcSchema

The event name is the schema's object path combined with separator.

```ts
import type { IpcSchemaOf } from 'typesafe-electron-ipc/define'

import { defineIpcSchema, mainSend, rendererFetch, rendererSend } from 'typesafe-electron-ipc/define'

export const MSG = defineIpcSchema({
  ipcTest: {
    msg: rendererFetch<string, string>(),
    front: rendererSend<[test: { test: number }, stamp: number]>(),
    back: mainSend<boolean>(),
    no: rendererSend(),
    test: {
      deep: rendererFetch<undefined, string>(),
    },
  },
  another: rendererFetch<{ a: number } | { b: string }, string>(),
})

export type IpcSchema = IpcSchemaOf<typeof MSG>
```

Or you can define type-only schema (Not recommend for debugging)
```ts
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

#### In Main Process

```ts
import type { IpcSchema } from '../ipc'

import { app, BrowserWindow } from 'electron'
import { useIpcMain } from 'typesafe-electron-ipc'

import { MSG } from '../ipc'

const main = useIpcMain<IpcSchema>()

// all functions are typesafe
app.whenReady().then(() => {
  main.send(BrowserWindow.getAllWindows()[0], MSG.ipcTest.back, true)
})

main.handle(MSG.ipcTest.msg, (_, data) => {
  return 'return from main'
})
main.on(MSG.ipcTest.front, (_, data, stamp) => {
  console.log(data, stamp)
})

const clearListener = main.on(MSG.ipcTest.no, () => console.log('no parameter'))
clearListener()

main.handle(MSG.ipcTest.test.deep, () => {
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

#### In Preload

```ts
import { exposeIpcRenderer } from 'typesafe-electron-ipc'

exposeIpcRenderer()
```

#### In Renderer Process

```ts
import type { IpcSchema } from '../ipc'

import { useIpcRenderer } from 'typesafe-electron-ipc/renderer'

import { MSG } from '../ipc'

const renderer = useIpcRenderer<IpcSchema>()

// all functions are typesafe
console.log(await renderer.invoke(MSG.ipcTest.msg, 'fetch from renderer'))
console.log(await renderer.invoke(MSG.ipcTest.test.deep))
console.log(await renderer.invoke('another', { a: 1 }))

renderer.send(MSG.ipcTest.front, { test: 1 }, Date.now())
renderer.send(MSG.ipcTest.no)

const clearListener = renderer.on(MSG.ipcTest.back, (_, data) => {
  console.log(`send from main process: ${data}`)
})
clearListener()
```

### Example

more usage see in [playground](./playground)

### Custom Serializer

```ts
import type { SerializerOptions } from 'typesafe-electron-ipc'

import { exposeCustomIpcRenderer, useCustomIpcMain } from 'typesafe-electron-ipc'

const options: SerializerOptions = {
  serializer: {/* options */}
}

// main
const customMain = useCustomIpcMain<IpcSchema>(options)

// preload
exposeCustomIpcRenderer(options)

// renderer
useIpcRenderer<IpcSchema>()
```

## Typesafe EventEmitter (Deprecated)

No longer needed, since `@types/node` offer built-in support

```ts
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
