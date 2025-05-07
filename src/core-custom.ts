import type { IpcSchema, TypedIpcMain, TypedIpcRenderer } from './types'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { BrowserWindow } from 'electron'

import electron from 'electron'

/**
 * custom serializer for {@link useCustomIpcMain}
 */
export type SerializerOptions = {
  serializer?: {
    serialize: (data: any[]) => string
    deserialize: (data: string) => any[]
  } | {
    serialize: (data: any[]) => ArrayBufferLike
    deserialize: (data: number[]) => any[]
  }
}

const noop = (e: any): any => e

function getSerializer(options: SerializerOptions): { encode: AnyFunction, decode: AnyFunction } {
  const { serializer } = options
  const decode = serializer
    ? (...args: any[]) => [serializer.deserialize(args[0])]
    : noop
  const encode = serializer
    ? (...args: any[]) => [serializer.serialize(args)]
    : noop

  return { encode, decode }
}

/**
 * create typesafe `ipcMain` with custom serializer
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-main example}
 */
export function useCustomIpcMain<T extends IpcSchema>(options: SerializerOptions): TypedIpcMain<T> {
  const { encode, decode } = getSerializer(options)

  const wrapListener = (listener: AnyFunction) =>
    (e: any, ...args: any[]) => listener(e, ...decode(args))

  return {
    handleOnce: (channel: string, listener: AnyFunction) =>
      electron.ipcMain.handleOnce(channel, wrapListener(listener)),

    handle: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handle(channel, wrapListener(listener))
      return () => electron.ipcMain.removeHandler(channel)
    },

    on: (channel: string, listener: AnyFunction) => {
      const wrapped = wrapListener(listener)
      electron.ipcMain.on(channel, wrapped)
      return () => electron.ipcMain.removeListener(channel, wrapped)
    },

    once: (channel: string, listener: AnyFunction) =>
      electron.ipcMain.once(channel, wrapListener(listener)),

    send: (win: BrowserWindow, channel: string, ...args: any[]) =>
      win.webContents.send(channel, ...encode(args)),

    removeHandler: electron.ipcMain.removeHandler.bind(electron.ipcMain),
    removeAllListeners: electron.ipcMain.removeAllListeners.bind(electron.ipcMain),
  } satisfies TypedIpcMain<T>
}

/**
 * custom options for {@link exposeCustomIpcRenderer}
 */
export type ExposeCustomIpcRendererOptions = SerializerOptions & {
  /**
   * custom global key,
   * @default '__ipcRenderer'
   */
  name?: string
}

/**
 * expost typesafe `ipcRenderer` with custom serializer
 * @param options expose options
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-preload example}
 */
export function exposeCustomIpcRenderer(options: ExposeCustomIpcRendererOptions): void {
  const { encode, decode } = getSerializer(options)
  const { ipcRenderer } = electron

  const wrapListener = (listener: AnyFunction) =>
    (e: any, ...args: any[]) => listener(e, ...decode(args))

  electron.contextBridge.exposeInMainWorld(
    options.name || '__ipcRenderer',
    {
      invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...encode(args)),
      send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...encode(args)),
      sendToHost: (channel: string, ...args: any[]) => ipcRenderer.sendToHost(channel, ...encode(args)),

      on: (channel: string, listener: AnyFunction) => {
        const wrapped = wrapListener(listener)
        ipcRenderer.on(channel, wrapped)
        return () => ipcRenderer.removeListener(channel, wrapped)
      },

      once: (channel: string, listener: AnyFunction) =>
        ipcRenderer.once(channel, wrapListener(listener)),

      postMessage: ipcRenderer.postMessage.bind(ipcRenderer),
      removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
    } satisfies TypedIpcRenderer<any>,
  )
}
