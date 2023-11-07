import electron from 'electron'
import type { BrowserWindow } from 'electron'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { IpcSchema, TypedIpcMain } from './types'

/**
 * create typesafe `ipcMain`
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-main example}
 */
export function useIpcMain<T extends IpcSchema>(): TypedIpcMain<T> {
  const expose = [
    'handleOnce',
    'once',
    'removeAllListeners',
    'removeHandler',
    'removeHandler',
  ].map(key => [key, electron.ipcMain[key]])
  expose.push(
    ['handle', (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handle(channel, listener)
      return () => {
        electron.ipcMain.removeHandler(channel)
      }
    }],
    ['on', (channel: string, listener: AnyFunction) => {
      electron.ipcMain.on(channel, listener)
      return () => {
        electron.ipcMain.removeListener(channel, listener)
      }
    }],
    ['send', (win: BrowserWindow, channel: string, ...args: any[]) => {
      win.webContents.send(channel, ...args)
    }],
  )
  return Object.fromEntries(expose)
}

/**
 * expost typesafe `ipcRenderer`
 * @param name custom global key
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-preload example}
 */
export function exposeIpcRenderer(name = '__ipcRenderer') {
  const expose = [
    'invoke',
    'once',
    'send',
    'sendToHost',
    'removeAllListeners',
    'removeListener',
    'postMessage',
  ].map(key => [key, electron.ipcRenderer[key]])
  expose.push(
    ['on', (channel: string, listener: AnyFunction) => {
      electron.ipcRenderer.on(channel, listener)
      return () => {
        electron.ipcRenderer.removeListener(channel, listener)
      }
    }],
  )
  electron.contextBridge.exposeInMainWorld(
    name,
    Object.fromEntries(expose),
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
