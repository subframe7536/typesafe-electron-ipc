import type { BrowserWindow } from 'electron'
import { ipcMain, ipcRenderer } from 'electron'
import type { SetupObject, TypesafeMainIpc, TypesafeRendererIpc } from './types'

/**
 * Returns a typesafe IPC object based on the provided setup object.
 * The returned object contains:
 *
 * @example
 *
 * #### in shared
 *
 * ```typescript
 * const state = {
 *   msg: fetchIpcFn<string, string>('msg'),
 *   front: rendererSendIpcFn<{ test: number }>('front'),
 *   back: mainSendIpcFn<boolean>('back'),
 * }
 * ```
 *
 * #### in preload
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
 * #### in main
 *
 * ```typescript
 * const {
 *   main,
 *   clearListeners,
 *   channels
 * } = generateTypesafeIpc(state, 'main')
 * main.msg((_, data) => { // data: string
 *   console.log(data)
 *   console.log(channels)
 *   return 'return from main'
 * })
 * ```
 *
 * #### in renderer
 *
 * ```typescript
 * export async function fetch() {
 *   const msg = await window.renderer.msg('fetch from renderer')
 *   console.log(msg) // msg: string
 * }
 * ```
 *
 * @param setup - the setup object to generate the IPC functions
 * @param process - the process to generate the IPC functions
 * @return the generated typesafe IPC object, includes:
 * - typed functions for the main or renderer
 * - all channels
 * - clearListeners method to remove all listeners for a given channel.
 */
export function generateTypesafeIpc<T extends SetupObject>(setup: T, process: 'renderer'): TypesafeRendererIpc<T>
export function generateTypesafeIpc<T extends SetupObject>(setup: T, process: 'main'): TypesafeMainIpc<T>
export function generateTypesafeIpc<T extends SetupObject>(setup: T, process: 'renderer' | 'main'): TypesafeRendererIpc<T> | TypesafeMainIpc<T> {
  return process === 'renderer' ? generateRendererIpcFn(setup) : generateMainIpcFn(setup)
}

export function generateRendererIpcFn<T extends SetupObject>(setup: T): TypesafeRendererIpc<T> {
  const renderer = {} as any
  const channels = {} as any
  for (const [k, v] of Object.entries(setup)) {
    const r = v.renderer as unknown
    if (typeof r === 'string') {
      if (['invoke', 'send', 'on', 'once'].includes(r)) {
        renderer[k] = ipcRenderer[r].bind(ipcRenderer, v.channel)
      } else {
        throw new TypeError(`invalid renderer function string: ${r}, valid string is 'invoke', 'send', 'on' or 'once'`)
      }
    } else if (typeof r === 'function') {
      renderer[k] = r
    } else {
      throw new TypeError(`invalid renderer function: ${r}`)
    }
    channels[k] = v.channel
  }
  return {
    renderer,
    channels,
    clearListeners(channel) {
      ipcRenderer.removeAllListeners(channel)
    },
  }
}
export function generateMainIpcFn<T extends SetupObject>(setup: T): TypesafeMainIpc<T> {
  const main = {} as any
  const channels = {} as any
  for (const [k, v] of Object.entries(setup)) {
    const m = v.main as unknown
    const c = v.channel
    if (typeof m === 'string') {
      if (m === 'send') {
        main[k] = (win: BrowserWindow, data: any) => {
          win.webContents.send(c, data)
        }
      } else if (['handle', 'on', 'once'].includes(m)) {
        main[k] = ipcMain[m].bind(ipcMain, c)
      } else {
        throw new TypeError(`invalid main function string: ${m}, valid string is 'handle', 'on' or 'once'`)
      }
    } else if (typeof m === 'function') {
      main[k] = m
    } else {
      throw new TypeError(`invalid main function: ${m}`)
    }
    channels[k] = c
  }
  return {
    main,
    channels,
    clearListeners(channel) {
      ipcMain.removeAllListeners(channel)
    },
  }
}

export { IpcFn, SetupObject, TypesafeMainIpc, TypesafeRendererIpc } from './types'
export * from './utils'
