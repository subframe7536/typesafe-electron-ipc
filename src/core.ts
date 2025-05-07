import type { IpcSchema, TypedIpcMain, TypedIpcMainWithBrowser, TypedIpcRenderer } from './types'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { BrowserWindow } from 'electron'

import electron from 'electron'

/**
 * create typesafe `ipcMain`
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-main example}
 */
export function useIpcMain<T extends IpcSchema>(): TypedIpcMain<T>
/**
 * create typesafe `ipcMain`
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-main example}
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
 * expost typesafe `ipcRenderer`
 * @param name custom renderer name
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-preload example}
 */
export function exposeIpcRenderer(name = '__ipcRenderer'): void {
  const { ipcRenderer } = electron
  electron.contextBridge.exposeInMainWorld(
    name,
    {
      invoke: ipcRenderer.invoke.bind(ipcRenderer),
      send: ipcRenderer.send.bind(ipcRenderer),
      sendToHost: ipcRenderer.sendToHost.bind(ipcRenderer),
      on: (channel: string, listener: AnyFunction) => {
        ipcRenderer.on(channel, listener)
        return () => ipcRenderer.removeListener(channel, listener)
      },
      once: ipcRenderer.once.bind(ipcRenderer),
      postMessage: ipcRenderer.postMessage.bind(ipcRenderer),
      removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
    } satisfies TypedIpcRenderer<any>,
  )
}

/**
 * wrapper for `contextBridge.exposeInMainWorld`
 * @param name expose name
 * @param data expose data
 */
export function exposeMain(name: string, data: unknown): void {
  electron.contextBridge.exposeInMainWorld(name, data)
}
