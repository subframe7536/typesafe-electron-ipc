import type { BrowserWindow } from 'electron'
import { ipcMain, ipcRenderer } from 'electron'
import { pathSet } from 'object-standard-path'
import type { GenericIpcFn, IpcFn, MainIpcFn, RendererIpcFn, SetupItem, TypesafeIpcMain, TypesafeIpcRenderer } from './types'

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
      throw new TypeError(`invalid main function string: ${m}, valid string is 'send', 'handle', 'on' or 'once'`)
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
  return (type === 'main' ? mainIpcFunction : rendererIpcFunction)(fn, path)
}

function isIpcFn(item: unknown): item is IpcFn<any, any> {
  return !!item && typeof item === 'object' && 'renderer' in item && 'main' in item
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
 *     msg: fetchIpcFn<[data: string, num: number], string>('msg'),
 *     front: rendererSendIpcFn<{ test: number }>(),
 *     back: mainSendIpcFn<boolean>(),
 *     test: {
 *       deep: fetchIpcFn<undefined, string>(),
 *     },
 *   },
 *   another: fetchIpcFn<string, string>(),
 * }
 * export type State = typeof state
 * ```
 *
 * #### preload.ts
 *
 * ```typescript
 * import { generateTypesafeIPC, exposeIPC } from 'typesafe-electron-ipc'
 *
 * exposeIPC(generateTypesafeIPC(state, 'renderer'))
 * ```
 *
 * #### main.ts
 *
 * ```typescript
 * import { generateTypesafeIPC } from 'typesafe-electron-ipc'
 *
 * const {
 *   main: { ipcTest },
 *   clearListeners,
 *   channels
 * } = generateTypesafeIPC(state, 'main')
 * ipcTest.msg((_, data, num) => {
 *   console.log(data, num) // 'fetch from renderer' 123456
 *   return 'return from main'
 * })
 * ```
 *
 * #### renderer.ts
 *
 * ```typescript
 * import { loadIPC } from 'typesafe-electron-ipc/renderer'
 *
 * const {
 *   renderer: { ipcTest },
 *   clearListeners,
 *   channels
 * } = loadIPC<State>()
 * export async function fetch() {
 *   const msg = await ipcTest.msg('fetch from renderer', 123456)
 *   console.log(msg) // 'return from main'
 * }
 * ```
 */
export function generateTypesafeIPC<T extends SetupItem>(
  setupModule: T, process: 'main'
): TypesafeIpcMain<T>
export function generateTypesafeIPC<T extends SetupItem>(
  setupModule: T, process: 'renderer'
): TypesafeIpcRenderer<T>
export function generateTypesafeIPC<T extends SetupItem>(
  setupModule: T, process: 'main' | 'renderer',
): TypesafeIpcMain<T> | TypesafeIpcRenderer<T> {
  const channels = {} // for build performance, don't use Channel<T>
  function parse(obj: SetupItem | GenericIpcFn, path = '', acc = {}) {
    if (isIpcFn(obj)) {
    // parse channel
      pathSet(channels, path.replace(/::/g, '.') as any, obj.channel ?? path)
      // parse ipc function
      return generateIpcFn(process, obj[process], obj.channel ?? path)
    }

    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}::${key}` : key
      acc[key] = parse(value, newPath, {})
    }

    return acc
  }

  const ret = {
    channels,
    clearListeners: (channel: string) => (process === 'main' ? ipcMain : ipcRenderer)?.removeAllListeners(channel),
  }
  ret[process] = parse(setupModule)
  return ret as any
}

export * from './utils'
