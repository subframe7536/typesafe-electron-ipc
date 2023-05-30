import type { BrowserWindow } from 'electron'
import { ipcMain, ipcRenderer } from 'electron'
import type { GenericIpcFn, IpcFn, MainIpcFn, Prettify, RendererIpcFn, SetupItem, TypesafeIpcMain, TypesafeIpcRenderer } from './types'

function rendererIpcFunction(r: unknown, path: string): RendererIpcFn {
  if (typeof r === 'string') {
    if (['invoke', 'send', 'on', 'once'].includes(r)) {
      return ipcRenderer[r].bind(ipcRenderer, path)
    } else {
      throw new TypeError(`invalid renderer function string: ${r}, valid string is 'invoke', 'send', 'on' or 'once'`)
    }
  } else if (typeof r === 'function') {
    return r as RendererIpcFn
  } else {
    throw new TypeError(`invalid renderer function: ${r}`)
  }
}

function mainIpcFunction(m: unknown, path: string): MainIpcFn {
  if (typeof m === 'string') {
    if (m === 'send') {
      return (win: BrowserWindow, data: any) => {
        win.webContents.send(path, data)
      }
    } else if (['handle', 'handleOnce', 'on', 'once'].includes(m)) {
      return ipcMain[m].bind(ipcMain, path)
    } else {
      throw new TypeError(`invalid main function string: ${m}, valid string is 'handle', 'on' or 'once'`)
    }
  } else if (typeof m === 'function') {
    return m as MainIpcFn
  } else {
    throw new TypeError(`invalid main function: ${m}`)
  }
}

function generateIpcFn(
  type: 'main' | 'renderer',
  fn: MainIpcFn | RendererIpcFn,
  path: string,
) {
  return type === 'main'
    ? mainIpcFunction(fn, path)
    : rendererIpcFunction(fn, path)
}

function isIpcFn(item: unknown): item is IpcFn<any, any> {
  return Boolean(item && typeof item === 'object' && 'renderer' in item && 'main' in item)
}

function pathSet(object: any, path: string, value: any) {
  let current = object
  const pathParts = path.split('.')

  for (let i = 0; i < pathParts.length; i++) {
    const key = pathParts[i]

    if (i === pathParts.length - 1) {
      current[key] = value
    } else {
      if (!current[key]) {
        current[key] = {}
      }
      current = current[key]
    }
  }
}
export function generateIpcFnModule<T extends SetupItem>(
  obj: T, type: 'main'
): Prettify<TypesafeIpcMain<T>>
export function generateIpcFnModule<T extends SetupItem>(
  obj: T, type: 'renderer'
): Prettify<TypesafeIpcRenderer<T>>
export function generateIpcFnModule<T extends SetupItem>(
  obj: T, type: 'main' | 'renderer',
): Prettify<TypesafeIpcMain<T>> | Prettify<TypesafeIpcRenderer<T>> {
  const channels = {} // for build performance, don't use Channel<T>
  function parse(obj: SetupItem | GenericIpcFn, path = '') {
    if (isIpcFn(obj)) {
      pathSet(channels, path.replace(/::/g, '.'), path)
      return generateIpcFn(type, obj[type], path)
    }
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key] = parse(value, path ? `${path}::${key}` : key)
      return acc
    }, {})
  }
  const ret = {
    channels,
    clearListeners(channel: string) {
      if (type === 'main') {
        ipcMain?.removeAllListeners(channel)
      } else {
        ipcRenderer?.removeAllListeners(channel)
      }
    },
  }
  ret[type] = parse(obj)
  return ret as any
}

export { SetupItem, TypesafeIpcMain, TypesafeIpcRenderer } from './types'
export * from './utils'
