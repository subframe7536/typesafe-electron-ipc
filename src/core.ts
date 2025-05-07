import type { IpcSchema, TypedIpcMain, TypedIpcMainWithBrowser, TypedIpcRenderer } from './types'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { BrowserWindow } from 'electron'

import electron from 'electron'

/**
 * Create typesafe `ipcMain`
 * @example
 * ```ts
 * import type { IpcSchema } from '../ipc'
 *
 * import { app, BrowserWindow } from 'electron'
 * import { useIpcMain } from 'typesafe-electron-ipc'
 *
 * import { MSG } from '../ipc'
 *
 * const main = useIpcMain<IpcSchema>()
 * // all functions are typesafe
 * app.whenReady().then(() => {
 *   main.send(BrowserWindow.getAllWindows()[0], MSG.ipcTest.back, true)
 * })
 * ```
 */
export function useIpcMain<T extends IpcSchema>(): TypedIpcMain<T>
/**
 * Create typesafe `ipcMain` on target BrowserWindow
 * @example
 * ```ts
 * import type { IpcSchema } from '../ipc'
 *
 * import { app, BrowserWindow } from 'electron'
 * import { useIpcMain } from 'typesafe-electron-ipc'
 *
 * import { MSG } from '../ipc'
 *
 * const main = useIpcMain<IpcSchema>(BrowserWindow.getAllWindows()[0])
 * // all functions are typesafe
 * app.whenReady().then(() => {
 *   main.send(MSG.ipcTest.back, true)
 * })
 * ```
 */
export function useIpcMain<T extends IpcSchema>(window: BrowserWindow): TypedIpcMainWithBrowser<T>
export function useIpcMain<T extends IpcSchema>(window?: BrowserWindow): TypedIpcMain<T> | TypedIpcMainWithBrowser<T> {
  return {
    send: window
      ? window.webContents.send.bind(window.webContents)
      : (win: BrowserWindow, channel: string, ...args: any[]) =>
          win.webContents.send(channel, ...args),
    handleOnce: electron.ipcMain.handleOnce.bind(electron.ipcMain),
    handle: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handle(channel, listener)
      return () => electron.ipcMain.removeHandler(channel)
    },
    on: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.on(channel, listener)
      return () => electron.ipcMain.removeListener(channel, listener)
    },
    once: electron.ipcMain.once.bind(electron.ipcMain),
    removeHandler: electron.ipcMain.removeHandler.bind(electron.ipcMain),
    removeAllListeners: electron.ipcMain.removeAllListeners.bind(electron.ipcMain),
  } as TypedIpcMain<T> | TypedIpcMainWithBrowser<T>
}
/**
 * Expose typesafe `ipcRenderer`
 * @param name Custom renderer name
 * @example
 * ```ts
 * import { exposeIpcRenderer } from 'typesafe-electron-ipc'
 *
 * exposeIpcRenderer()
 * ```
 */
export function exposeIpcRenderer(name = '__ipcRenderer'): void {
  exposeMain(
    name,
    {
      invoke: electron.ipcRenderer.invoke.bind(electron.ipcRenderer),
      send: electron.ipcRenderer.send.bind(electron.ipcRenderer),
      sendToHost: electron.ipcRenderer.sendToHost.bind(electron.ipcRenderer),
      on: (channel: string, listener: AnyFunction) => {
        electron.ipcRenderer.on(channel, listener)
        return () => electron.ipcRenderer.removeListener(channel, listener)
      },
      once: electron.ipcRenderer.once.bind(electron.ipcRenderer),
      postMessage: electron.ipcRenderer.postMessage.bind(electron.ipcRenderer),
      removeAllListeners: electron.ipcRenderer.removeAllListeners.bind(electron.ipcRenderer),
    } satisfies TypedIpcRenderer<any>,
  )
}

/**
 * Wrapper for `contextBridge.exposeInMainWorld`
 * @param name Exposed name
 * @param data Exposed data
 */
export function exposeMain(name: string, data: unknown): void {
  electron.contextBridge.exposeInMainWorld(name, data)
}
