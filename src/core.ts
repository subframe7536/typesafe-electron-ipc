import { contextBridge, ipcMain, ipcRenderer } from 'electron'
import type { BrowserWindow } from 'electron'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { IpcSchema, TypedIpcMain, TypedIpcRenderer } from './types'

/**
 * create typesafe `ipcMain`
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-main example}
 */
export function useIpcMain<T extends IpcSchema>(): TypedIpcMain<T> {
  return {
    handleOnce: (channel: string, listener: AnyFunction) => {
      ipcMain.handleOnce(channel, listener)
    },
    handle: (channel: string, listener: AnyFunction) => {
      ipcMain.handle(channel, listener)
      return () => ipcMain.removeHandler(channel)
    },
    on: (channel: string, listener: AnyFunction) => {
      ipcMain.on(channel, listener)
      return () => {
        ipcMain.removeListener(channel, listener)
      }
    },
    once: (channel: string, listener: AnyFunction) => {
      ipcMain.once(channel, listener)
    },
    send: (win: BrowserWindow, channel: string, ...args: any[]) => {
      win.webContents.send(channel, ...args)
    },
    removeHandler: (channel: string) => {
      ipcMain.removeHandler(channel)
    },
    removeAllListeners: (channel?: string) => {
      ipcMain.removeAllListeners(channel)
    },
  } satisfies TypedIpcMain<T>
}

/**
 * expost typesafe `ipcRenderer`
 * @param name custom renderer name
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-preload example}
 */
export function exposeIpcRenderer(name = '__ipcRenderer') {
  contextBridge.exposeInMainWorld(
    name,
    {
      invoke: (channel: string, ...args: any[]) => {
        return ipcRenderer.invoke(channel, ...args)
      },
      send: (channel: string, ...args: any[]) => {
        ipcRenderer.send(channel, ...args)
      },
      sendToHost: (channel: string, ...args: any[]) => {
        ipcRenderer.sendToHost(channel, ...args)
      },
      on: (channel: string, listener: AnyFunction) => {
        ipcRenderer.on(channel, listener)
        return () => {
          ipcRenderer.removeListener(channel, listener)
        }
      },
      once: (channel: string, listener: AnyFunction) => {
        ipcRenderer.once(channel, listener)
      },
      postMessage: (channel: string, message: any, transfer?: MessagePort[]) => {
        ipcRenderer.postMessage(channel, message, transfer)
      },
      removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel)
      },
    } satisfies TypedIpcRenderer<any>,
  )
}

/**
 * wrapper for `contextBridge.exposeInMainWorld`
 * @param name expose name
 * @param data expose data
 */
export function exposeMain(name: string, data: unknown) {
  contextBridge.exposeInMainWorld(name, data)
}
