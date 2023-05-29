import type { BrowserWindow } from 'electron'
import { ipcMain, ipcRenderer } from 'electron'
import type { SetupItem, SetupModule, TypesafeIpcMain, TypesafeIpcRenderer } from './types'

function generateTypesafeIpcModule<T extends SetupModule>(setupRecord: T, process: 'renderer'): TypesafeIpcRenderer<T>
function generateTypesafeIpcModule<T extends SetupModule>(setupRecord: T, process: 'main'): TypesafeIpcMain<T>
function generateTypesafeIpcModule<T extends SetupModule>(setupRecord: T, process: 'renderer' | 'main') {
  const fn = process === 'renderer'
    ? generateTypesafeIpcRenderer
    : generateTypesafeIpcMain
  return fn(setupRecord)
}

function rendererIpcFunction(moduleKey: string, item: SetupItem) {
  const rendererItem = {} as any
  const channel = {} as any
  for (const [k, v] of Object.entries(item)) {
    const r = v.renderer as unknown
    const c = `${moduleKey}::${k}`
    let fn: Function
    if (typeof r === 'string') {
      if (['invoke', 'send', 'on', 'once'].includes(r)) {
        fn = ipcRenderer[r].bind(ipcRenderer, c)
      } else {
        throw new TypeError(`invalid renderer function string: ${r}, valid string is 'invoke', 'send', 'on' or 'once'`)
      }
    } else if (typeof r === 'function') {
      fn = r
    } else {
      throw new TypeError(`invalid renderer function: ${r}`)
    }
    rendererItem[k] = fn
    channel[k] = c
  }
  return {
    rendererItem,
    channel,
  }
}
function generateTypesafeIpcRenderer<
  T extends SetupModule,
>(setupModule: T): TypesafeIpcRenderer<T> {
  const renderer = {} as any
  const channels = {} as any
  for (const [module, item] of Object.entries(setupModule)) {
    const fn = rendererIpcFunction(module, item)
    renderer[module] = fn.rendererItem
    channels[module] = fn.channel
  }
  return {
    renderer,
    channels,
    clearListeners(channel) {
      ipcRenderer.removeAllListeners(channel)
    },
  }
}
function mainIpcFunction(moduleKey: string, item: SetupItem) {
  const mainItem = {} as any
  const channel = {} as any
  for (const [k, v] of Object.entries(item)) {
    const m = v.main as unknown
    const c = `${moduleKey}::${k}`
    let fn: Function
    if (typeof m === 'string') {
      if (m === 'send') {
        fn = (win: BrowserWindow, data: any) => {
          win.webContents.send(c, data)
        }
      } else if (['handle', 'handleOnce', 'on', 'once'].includes(m)) {
        fn = ipcMain[m].bind(ipcMain, c)
      } else {
        throw new TypeError(`invalid main function string: ${m}, valid string is 'handle', 'on' or 'once'`)
      }
    } else if (typeof m === 'function') {
      fn = m
    } else {
      throw new TypeError(`invalid main function: ${m}`)
    }
    mainItem[k] = fn
    channel[k] = c
  }
  return {
    mainItem,
    channel,
  }
}

function generateTypesafeIpcMain<
  T extends SetupModule,
>(setupRecord: T): TypesafeIpcMain<T> {
  const main = {} as any
  const channels = {} as any
  for (const [module, item] of Object.entries(setupRecord)) {
    const fn = mainIpcFunction(module, item)
    main[module] = fn.mainItem
    channels[module] = fn.channel
  }
  return {
    main,
    channels,
    clearListeners(channel) {
      ipcMain.removeAllListeners(channel)
    },
  }
}

export {
  generateTypesafeIpcModule,
  generateTypesafeIpcMain,
  generateTypesafeIpcRenderer,
}

export type {
  SetupModule,
  TypesafeIpcMain,
  TypesafeIpcRenderer,
} from './types'

export * from './utils'
