import electron from 'electron'
import type { BrowserWindow } from 'electron'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { IpcSchema, TypedIpcMain, TypedIpcRenderer } from './types'

/**
 * create typesafe `ipcMain`
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-main example}
 */
export function useIpcMain<T extends IpcSchema>(): TypedIpcMain<T> {
  return {
    handleOnce: (channel, listener: AnyFunction) => {
      electron.ipcMain.handleOnce(channel, listener)
    },
    handle: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handle(channel, listener)
      return () => {
        electron.ipcMain.removeHandler(channel)
      }
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
    send: (win: BrowserWindow, channel: string, ...args: any[]) => {
      win.webContents.send(channel, ...args)
    },
    removeHandler: (channel: string) => {
      electron.ipcMain.removeHandler(channel)
    },
    removeListener: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.removeListener(channel, listener)
    },
    removeAllListeners: (channel?: string) => {
      electron.ipcMain.removeAllListeners(channel)
    },
  }
}

/**
 * expost typesafe `ipcRenderer`
 * @param name custom global key
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-preload example}
 */
export function exposeIpcRenderer(name = '__ipcRenderer') {
  electron.contextBridge.exposeInMainWorld(
    name,
    {
      invoke: (channel: string, ...args: any[]) => {
        return electron.ipcRenderer.invoke(channel, ...args)
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
      send: (channel: string, ...args: any[]) => {
        electron.ipcRenderer.send(channel, ...args)
      },
      sendToHost: (channel: string, ...args: any[]) => {
        electron.ipcRenderer.sendToHost(channel, ...args)
      },
      removeListener: (channel: string, listener: AnyFunction) => {
        electron.ipcRenderer.removeListener(channel, listener)
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
export function exposeMain(name: string, data: unknown) {
  electron.contextBridge.exposeInMainWorld(name, data)
}
