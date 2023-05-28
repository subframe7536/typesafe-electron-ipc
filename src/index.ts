import type { BrowserWindow } from 'electron'
import { ipcMain, ipcRenderer } from 'electron'
import type { SetupObject, TypesafeMainIpc, TypesafeRendererIpc } from './types'

/**
 * Returns a typesafe IPC object based on the provided setup object.
 * The returned object contains:
 * - typed functions for the main
 * - typed functions for the renderer
 * - all channels
 * - clearListeners method to remove all listeners for a given channel.
 *
 * @example
 * #### preload.ts

 * ```typescript
 * const state = {
 *   msg: fetchIpcFn<string, string>('msg'),
 *   front: rendererSendIpcFn<{ test: number }>('front'),
 *   back: mainSendIpcFn<boolean>('back'),
 * }
 * // exposed by contextBridge.exposeInMainWorld
 * const {
 *   renderer,
 *   clearListeners,
 *   channels
 * } = generateTypesafeIpc(state, 'renderer')
 * ```
 *
 * #### main.ts
 *
 * ```typescript
 * const {
 *   main,
 *   clearListeners,
 *   channels
 * } = generateTypesafeIpc(state, 'main')
 * main.msg((_, data) => {
 *   console.log(data)
 *   console.log(channels)
 *   return 'return from main'
 * })
 * ```
 *
 * #### renderer.ts
 *
 * ```typescript
 * export async function fetch() {
 *   console.log(await renderer.msg('fetch from renderer'))
 * }
 * ```
 *
 * @param {T extends SetupObject} setup - the setup object to generate the IPC object from
 * @return {TypesafeIpc<T>} the generated typesafe IPC object
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
    const r = v.renderer as unknown as string
    renderer[k] = ipcRenderer[r].bind(ipcRenderer, v.channel)
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
    const m = v.main as unknown as string
    const c = v.channel
    main[k] = m === 'send'
      ? (win: BrowserWindow, data: any) => {
          win.webContents.send(c, data)
        }
      : ipcMain[m].bind(ipcMain, c)
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
