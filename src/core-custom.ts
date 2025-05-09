import type { IpcSchema, TypedIpcMain, TypedIpcMainWithBrowser, TypedIpcRenderer } from './types'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { BrowserWindow } from 'electron'

import electron from 'electron'

import { exposeMain } from './core'

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
 * Create typesafe `ipcMain` with custom serializer
 * @example
 * ```ts
 * import type { SerializerOptions } from 'typesafe-electron-ipc'
 *
 * import { useCustomIpcMain } from 'typesafe-electron-ipc'
 *
 * const options: SerializerOptions = {
 *   serializer: {} // options
 * }
 *
 * const customMain = useCustomIpcMain<IpcSchema>(options)
 * ```
 */
export function useCustomIpcMain<T extends IpcSchema>(options: SerializerOptions): TypedIpcMain<T>
/**
 * Create typesafe `ipcMain` with custom serializer on target BrowserWindow
 * @example
 * ```ts
 * import type { SerializerOptions } from 'typesafe-electron-ipc'
 *
 * import { app, BrowserWindow } from 'electron'
 * import { useCustomIpcMain } from 'typesafe-electron-ipc'
 *
 * const options: SerializerOptions = {
 *   serializer: {} // options
 * }
 *
 * const customMain = useCustomIpcMain<IpcSchema>(options, BrowserWindow.getAllWindows()[0])
 * ```
 */
export function useCustomIpcMain<T extends IpcSchema>(options: SerializerOptions, window: BrowserWindow): TypedIpcMainWithBrowser<T>
export function useCustomIpcMain<T extends IpcSchema>(options: SerializerOptions, window?: BrowserWindow): TypedIpcMain<T> | TypedIpcMainWithBrowser<T> {
  const { encode, decode } = getSerializer(options)

  const wrapListener = (listener: AnyFunction) =>
    (e: any, ...args: any[]) => listener(e, ...decode(args))

  const ipc = electron.ipcMain
  return {
    handleOnce: (channel: string, listener: AnyFunction) =>
      ipc.handleOnce(channel, wrapListener(listener)),

    handle: (channel: string, listener: AnyFunction) => {
      ipc.handle(channel, wrapListener(listener))
      return () => ipc.removeHandler(channel)
    },

    on: (channel: string, listener: AnyFunction) => {
      const wrapped = wrapListener(listener)
      ipc.on(channel, wrapped)
      return () => ipc.removeListener(channel, wrapped)
    },

    once: (channel: string, listener: AnyFunction) =>
      ipc.once(channel, wrapListener(listener)),

    send: window
      ? (channel: string, ...args: any[]) =>
          window.webContents.send(channel, ...encode(args))
      : (win: BrowserWindow, channel: string, ...args: any[]) =>
          win.webContents.send(channel, ...encode(args)),

    removeHandler: ipc.removeHandler.bind(ipc),
    removeAllListeners: ipc.removeAllListeners.bind(ipc),
  } as TypedIpcMain<T> | TypedIpcMainWithBrowser<T>
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
 * Expose typesafe `ipcRenderer` with custom serializer
 * @param options Expose options
 * @example
 * ```ts
 * import type { SerializerOptions } from 'typesafe-electron-ipc'
 *
 * import { exposeCustomIpcRenderer } from 'typesafe-electron-ipc'
 *
 * const options: SerializerOptions = {
 *   serializer: {} // options
 * }
 *
 * exposeCustomIpcRenderer(options)
 * ```
 */
export function exposeCustomIpcRenderer(options: ExposeCustomIpcRendererOptions): void {
  const { encode, decode } = getSerializer(options)

  const wrapListener = (listener: AnyFunction) =>
    (e: any, ...args: any[]) => listener(e, ...decode(args))

  const ipc = electron.ipcRenderer
  exposeMain(
    options.name || '__ipcRenderer',
    {
      invoke: (channel: string, ...args: any[]) => ipc.invoke(channel, ...encode(args)),
      send: (channel: string, ...args: any[]) => ipc.send(channel, ...encode(args)),
      sendToHost: (channel: string, ...args: any[]) => ipc.sendToHost(channel, ...encode(args)),

      on: (channel: string, listener: AnyFunction) => {
        const wrapped = wrapListener(listener)
        ipc.on(channel, wrapped)
        return () => ipc.removeListener(channel, wrapped)
      },

      once: (channel: string, listener: AnyFunction) =>
        ipc.once(channel, wrapListener(listener)),

      postMessage: ipc.postMessage.bind(ipc),
      removeAllListeners: ipc.removeAllListeners.bind(ipc),
    } satisfies TypedIpcRenderer<any>,
  )
}
