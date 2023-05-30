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

/**
 * generate typesafe ipc function modules
 * @param setupModule module object
 * @param process will be used in 'renderer' or 'main'
 *
 * @example
 * #### in shared
 *
 * ```typescript
 * const state = {
 *   ipcTest: {
 *     msg: fetchIpcFn<string, string>(),
 *     front: rendererSendIpcFn<{ test: number }>(),
 *     back: mainSendIpcFn<boolean>(),
 *     test: {
 *       deep: fetchIpcFn<string, string>(),
 *     },
 *   },
 *   another: fetchIpcFn<string, string>(),
 * }
 * ```
 *
 * #### preload.ts
 *
 * ```typescript
 * const {
 *   renderer,
 *   clearListeners,
 *   channels
 * } = generateTypesafeIpc(state, 'renderer')
 * contextBridge.exposeInMainWorld('renderer', renderer)
 * ```
 *
 * #### main.ts
 *
 * ```typescript
 * const {
 *   main: { ipcTest },
 *   clearListeners,
 *   channels
 * } = generateTypesafeIpc(state, 'main')
 * ipcTest.msg((_, data) => {
 *   console.log(data) // 'fetch from renderer'
 *   return 'return from main'
 * })
 * ```
 *
 * #### renderer.ts
 *
 * ```typescript
 * export async function fetch() {
 *   const msg = await window.renderer.ipcTest.msg('fetch from renderer')
 *   console.log(msg) // 'return from main'
 * }
 * ```
 */
export function generateTypesafeIpc<T extends SetupItem>(
  setupModule: T, process: 'main'
): Prettify<TypesafeIpcMain<T>>
export function generateTypesafeIpc<T extends SetupItem>(
  setupModule: T, process: 'renderer'
): Prettify<TypesafeIpcRenderer<T>>
export function generateTypesafeIpc<T extends SetupItem>(
  setupModule: T, process: 'main' | 'renderer',
): Prettify<TypesafeIpcMain<T>> | Prettify<TypesafeIpcRenderer<T>> {
  const channels = {} // for build performance, don't use Channel<T>
  function parse(obj: SetupItem | GenericIpcFn, path = '') {
    if (isIpcFn(obj)) {
      // parse channel
      pathSet(channels, path.replace(/::/g, '.'), path)
      // parse ipc function
      return generateIpcFn(process, obj[process], path)
    }
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[key] = parse(value, path ? `${path}::${key}` : key)
      return acc
    }, {})
  }
  const ret = {
    channels,
    clearListeners(channel: string) {
      if (process === 'main') {
        ipcMain?.removeAllListeners(channel)
      } else {
        ipcRenderer?.removeAllListeners(channel)
      }
    },
  }
  ret[process] = parse(setupModule)
  return ret as any
}

export { SetupItem, TypesafeIpcMain, TypesafeIpcRenderer } from './types'
export * from './utils'
