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

  return {
    handleOnce: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handleOnce(channel, (e, ...args) => listener(e, ...decode(args)))
    },
    handle: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.handle(channel, (e, ...args) => listener(e, ...decode(args)))
      return () => {
        electron.ipcMain.removeHandler(channel)
      }
    },
    on: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.on(channel, (e, ...args) => listener(e, ...decode(args)))
      return () => {
        electron.ipcMain.removeListener(channel, listener)
      }
    },
    once: (channel: string, listener: AnyFunction) => {
      electron.ipcMain.once(channel, (e, ...args) => listener(e, ...decode(args)))
    },
    send: (win: BrowserWindow, channel: string, ...args: any[]) => {
      win.webContents.send(channel, ...encode(args))
    },
    removeHandler: (channel: string) => {
      electron.ipcMain.removeHandler(channel)
    },
    removeAllListeners: (channel?: string) => {
      electron.ipcMain.removeAllListeners(channel)
    },
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

  electron.contextBridge.exposeInMainWorld(
    options.name || '__ipcRenderer',
    {
      invoke: (channel: string, ...args: any[]) => {
        return electron.ipcRenderer.invoke(channel, ...encode(args))
      },
      send: (channel: string, ...args: any[]) => {
        electron.ipcRenderer.send(channel, ...encode(args))
      },
      sendToHost: (channel: string, ...args: any[]) => {
        electron.ipcRenderer.sendToHost(channel, ...encode(args))
      },
      on: (channel: string, listener: AnyFunction) => {
        const _listener = (e: any, ...args: any[]): void => listener(e, ...decode(args))
        electron.ipcRenderer.on(channel, _listener)
        return () => {
          electron.ipcRenderer.removeListener(channel, _listener)
        }
      },
      once: (channel: string, listener: AnyFunction) => {
        electron.ipcRenderer.once(channel, (e, ...args) => listener(e, ...decode(args)))
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
