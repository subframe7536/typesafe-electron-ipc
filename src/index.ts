import { ipcMain, ipcRenderer } from 'electron'
import { SetupObject, TypesafeIpc } from './types'
/**
 * Returns a typesafe IPC object based on the provided setup object.
 * The returned object contains:
 * - typed functions for the main
 * - typed functions for the renderer
 * - all channels
 * - clearListeners method to remove all listeners for a given channel.
 *
 * @example
 * ```typescript
 * // in preload.ts, expose by contextBridge.exposeInMainWorld
 * const state = {
 *   msg: fetchIpcFn<string, string>('msg'),
 *   front: rendererSendIpcFn<{ test: number }>('front'),
 *   back: mainSendIpcFn<boolean>('back'),
 * }
 * export const {
 *   main,
 *   renderer,
 *   clearListeners,
 *   channels
 * } = generateTypesafeIpc(state)
 *
 * // in main.ts
 * main.msg((_, data) => {
 *   console.log(data)
 *   console.log(channels)
 *   return 'return from main'
 * })
 * // in renderer.ts
 * export async function fetch() {
 *   console.log(await renderer.msg('fetch from renderer'))
 * }
 * ```
 *
 * @param {T extends SetupObject} setup - the setup object to generate the IPC object from
 * @return {TypesafeIpc<T>} the generated typesafe IPC object
 */
export function generateTypesafeIpc<T extends SetupObject>(setup: T): TypesafeIpc<T> {
  const main = {} as any
  const renderer = {} as any
  const channels = {} as any
  for (const [k, v] of Object.entries(setup)) {
    main[k as keyof T] = v.main
    renderer[k as keyof T] = v.renderer
    channels[k as keyof T] = v.channel
  }
  return {
    main,
    renderer,
    channels,
    clearListeners(channel) {
      ipcMain?.removeAllListeners(channel)
      channel && ipcRenderer?.removeAllListeners(channel)
    },
  }
}
export { IpcFn, SetupObject, TypesafeIpc } from './types'
export * from './utils'