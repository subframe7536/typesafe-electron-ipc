import electron from 'electron'
import type { BrowserWindow } from 'electron'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { IpcSchema, TypedIpcMain, TypedIpcMainWithBrowser, TypedIpcRenderer } from './types'

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
      ? (channel: string, ...args: any[]) => {
          window.webContents.send(channel, ...args)
        }
      : (win: BrowserWindow, channel: string, ...args: any[]) => {
          win.webContents.send(channel, ...args)
        },
    handleOnce: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handleOnce(channel, listener)
    },
    handle: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handle(channel, listener)
      return () => electron.ipcMain.removeHandler(channel)
    },
    on: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.on(channel, listener)
      return () => {
        electron.ipcMain.removeListener(channel, listener)
      }
    },
    once: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.once(channel, listener)
    },
    removeHandler: (channel: string) => {
      electron.ipcMain.removeHandler(channel)
    },
    removeAllListeners: (channel?: string) => {
      electron.ipcMain.removeAllListeners(channel)
    },
  } as TypedIpcMain<T> | TypedIpcMainWithBrowser<T>
}

/**
 * expost typesafe `ipcRenderer`
 * @param name custom renderer name
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-preload example}
 */
export function exposeIpcRenderer(name = '__ipcRenderer'): void {
  electron.contextBridge.exposeInMainWorld(
    name,
    {
      invoke: (channel: string, ...args: any[]) => {
        return electron.ipcRenderer.invoke(channel, ...args)
      },
      send: (channel: string, ...args: any[]) => {
        electron.ipcRenderer.send(channel, ...args)
      },
      sendToHost: (channel: string, ...args: any[]) => {
        electron.ipcRenderer.sendToHost(channel, ...args)
      },
      on: (channel: string, listener: AnyFunction) => {
        electron.ipcRenderer.on(channel, listener)
        return () => {
          electron.ipcRenderer.removeListener(channel, listener)
        }
      },
      once: (channel: string, listener: AnyFunction) => {
        electron.ipcRenderer.once(channel, listener)
      },
      postMessage: (channel: string, message: any, transfer?: MessagePort[]) => {
        electron.ipcRenderer.postMessage(channel, message, transfer)
      },
      removeAllListeners: (channel: string) => {
        electron.ipcRenderer.removeAllListeners(channel)
      },
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
