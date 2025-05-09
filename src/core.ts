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
  const ipc = electron.ipcMain
  return {
    send: window
      ? window.webContents.send.bind(window.webContents)
      : (win: BrowserWindow, channel: string, ...args: any[]) =>
          win.webContents.send(channel, ...args),
    handleOnce: ipc.handleOnce.bind(ipc),
    handle: (channel: string, listener: AnyFunction) => {
      ipc.handle(channel, listener)
      return () => ipc.removeHandler(channel)
    },
    on: (channel: string, listener: AnyFunction) => {
      ipc.on(channel, listener)
      return () => ipc.removeListener(channel, listener)
    },
    once: ipc.once.bind(ipc),
    removeHandler: ipc.removeHandler.bind(ipc),
    removeAllListeners: ipc.removeAllListeners.bind(ipc),
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
  const ipc = electron.ipcRenderer
  exposeMain(
    name,
    {
      invoke: ipc.invoke.bind(ipc),
      send: ipc.send.bind(ipc),
      sendToHost: ipc.sendToHost.bind(ipc),
      on: (channel: string, listener: AnyFunction) => {
        ipc.on(channel, listener)
        return () => ipc.removeListener(channel, listener)
      },
      once: ipc.once.bind(ipc),
      postMessage: ipc.postMessage.bind(ipc),
      removeAllListeners: ipc.removeAllListeners.bind(ipc),
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
