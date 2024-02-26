import type {
  ParseFunction,
  ParseParameters,
  Promisable,
  RemoveNeverProps,
  StringKeys,
} from '@subframe7536/type-utils'
import type { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent, IpcRendererEvent } from 'electron'
import type { MainSend, RendererFetch, RendererSend } from './define'

export type IpcSchema = Record<string, MainSend<any> | RendererSend<any> | RendererFetch<any, any>>

type MS<T extends IpcSchema> = RemoveNeverProps<{
  [K in keyof T]: T[K] extends MainSend<infer Data>
    ? ParseParameters<Data>
    : never;
}>

type RS<T extends IpcSchema> = RemoveNeverProps<{
  [K in keyof T]: T[K] extends RendererSend<infer Data>
    ? ParseParameters<Data>
    : never;
}>

type RF<T extends IpcSchema> = RemoveNeverProps<{
  [K in keyof T]: T[K] extends RendererFetch<infer Data, infer Return>
    ? {
        params: ParseParameters<Data>
        return: Return
      }
    : never;
}>

/**
 * {@link https://github.com/subframe7536/typesafe-electron-ipc#in-main example}
 */
export interface TypedIpcMain<T extends IpcSchema> {
  send: <E extends StringKeys<MS<T>>>(win: BrowserWindow, channel: E, ...args: MS<T>[E]) => void
  handle: <E extends StringKeys<RF<T>>>(
    channel: E,
    listener: (event: IpcMainInvokeEvent, ...args: RF<T>[E]['params']) => Promisable<RF<T>[E]['return']>
  ) => VoidFunction
  handleOnce: <E extends StringKeys<RF<T>>>(
    channel: E,
    listener: (event: IpcMainInvokeEvent, ...args: RF<T>[E]['params']) => Promisable<RF<T>[E]['return']>
  ) => void
  on: <E extends StringKeys<RS<T>>>(
    channel: E,
    listener: (event: IpcMainEvent, ...args: RS<T>[E]) => void
  ) => VoidFunction
  once: <E extends StringKeys<RS<T>>>(
    channel: E,
    listener: (event: IpcMainEvent, ...args: RS<T>[E]) => void
  ) => void
  removeAllListeners: (channel?: StringKeys<RS<T>>) => void
  removeHandler: (channel: StringKeys<RF<T>>) => void
}

/**
 * {@link https://github.com/subframe7536/typesafe-electron-ipc#in-renderer example}
 */
export interface TypedIpcRenderer<T extends IpcSchema> {
  invoke: <E extends StringKeys<RF<T>>>(channel: E, ...args: RF<T>[E]['params']) => Promise<RF<T>[E]['return']>
  on: <E extends StringKeys<MS<T>>>(
    channel: E,
    listener: (event: IpcRendererEvent, ...args: MS<T>[E]) => void
  ) => VoidFunction
  once: <E extends StringKeys<MS<T>>>(
    channel: E,
    listener: (event: IpcRendererEvent, ...args: MS<T>[E]) => void
  ) => void
  send: <E extends StringKeys<RS<T>>>(channel: E, ...args: RS<T>[E]) => void
  sendToHost: <E extends StringKeys<RS<T>>>(channel: E, ...args: RS<T>[E]) => void
  removeAllListeners: (channel: StringKeys<MS<T>>) => void
  postMessage: (channel: string, message: any, transfer?: MessagePort[]) => void
}

export interface TypedEventEmitter<
  T extends Record<string | symbol, ParseParameters<any>>,
  Events extends Extract<keyof T, string | symbol> = Extract<keyof T, string | symbol>,
> extends NodeJS.EventEmitter {
  addListener: <E extends Events>(eventName: E, listener: ParseFunction<T[E]>) => this
  removeListener: <E extends Events>(eventName: E, listener: ParseFunction<T[E]>) => this
  removeAllListeners: <E extends Events>(event?: E) => this
  setMaxListeners: (n: number) => this
  getMaxListeners: () => number
  listeners: <E extends Events>(eventName: E) => Function[]
  rawListeners: <E extends Events>(eventName: E) => Function[]
  listenerCount: <E extends Events>(eventName: E, listener?: Function) => number
  prependListener: <E extends Events>(eventName: E, listener: ParseFunction<T[E]>) => this
  prependOnceListener: <E extends Events>(eventName: E, listener: ParseFunction<T[E]>) => this
  eventNames: () => Events[]
}
