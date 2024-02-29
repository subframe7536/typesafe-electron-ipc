import { contextBridge, ipcMain, ipcRenderer } from 'electron'
import type { BrowserWindow } from 'electron'
import type { AnyFunction } from '@subframe7536/type-utils'
import type { IpcSchema, TypedIpcMain, TypedIpcRenderer } from './types'

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

const noop = (e: any) => e

function getSerializer(options: SerializerOptions) {
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
      ipcMain.handleOnce(channel, (e, ...args) => listener(e, ...decode(args)))
    },
    handle: (channel: string, listener: AnyFunction) => {
      ipcMain.handle(channel, (e, ...args) => listener(e, ...decode(args)))
      return () => {
        ipcMain.removeHandler(channel)
      }
    },
    on: (channel: string, listener: AnyFunction) => {
      ipcMain.on(channel, (e, ...args) => listener(e, ...decode(args)))
      return () => {
        ipcMain.removeListener(channel, listener)
      }
    },
    once: (channel: string, listener: AnyFunction) => {
      ipcMain.once(channel, (e, ...args) => listener(e, ...decode(args)))
    },
    send: (win: BrowserWindow, channel: string, ...args: any[]) => {
      win.webContents.send(channel, ...encode(args))
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
export function exposeCustomIpcRenderer(options: ExposeCustomIpcRendererOptions) {
  const { encode, decode } = getSerializer(options)

  contextBridge.exposeInMainWorld(
    options.name || '__ipcRenderer',
    {
      invoke: (channel: string, ...args: any[]) => {
        return ipcRenderer.invoke(channel, ...encode(args))
      },
      send: (channel: string, ...args: any[]) => {
        ipcRenderer.send(channel, ...encode(args))
      },
      sendToHost: (channel: string, ...args: any[]) => {
        ipcRenderer.sendToHost(channel, ...encode(args))
      },
      on: (channel: string, listener: AnyFunction) => {
        const _listener = (e: any, ...args: any[]) => listener(e, ...decode(args))
        ipcRenderer.on(channel, _listener)
        return () => {
          ipcRenderer.removeListener(channel, _listener)
        }
      },
      once: (channel: string, listener: AnyFunction) => {
        ipcRenderer.once(channel, (e, ...args) => listener(e, ...decode(args)))
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
