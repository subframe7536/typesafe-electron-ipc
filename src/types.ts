import type {
  ParseFunction,
  ParseParameters,
  Promisable,
  RemoveNeverProps,
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
export interface TypedIpcMain<
  T extends IpcSchema,
  MainSend extends Record<string, any[]> = MS<T>,
  RendererSend extends Record<string, any[]> = RS<T>,
  RendererFetch extends Record<string, { params: any[]; return: any }> = RF<T>,
> {
  send<E extends keyof MainSend>(win: BrowserWindow, channel: E, ...args: MainSend[E]): void
  handle<E extends keyof RendererFetch>(
    channel: E,
    listener: (event: IpcMainInvokeEvent, ...args: RendererFetch[E]['params']) => Promisable<RendererFetch[E]['return']>
  ): VoidFunction
  handleOnce<E extends keyof RendererFetch>(
    channel: E,
    listener: (event: IpcMainInvokeEvent, ...args: RendererFetch[E]['params']) => Promisable<RendererFetch[E]['return']>
  ): void
  on<E extends keyof RendererSend>(
    channel: E,
    listener: (event: IpcMainEvent, ...args: RendererSend[E]) => void
  ): VoidFunction
  once<E extends keyof RendererSend>(
    channel: E,
    listener: (event: IpcMainEvent, ...args: RendererSend[E]) => void
  ): this
  removeAllListeners(channel?: keyof RendererSend): this
  removeHandler(channel: keyof RendererFetch): void
  removeListener<E extends keyof RendererSend>(
    channel: E,
    listener: (event: IpcMainEvent, ...args: RendererSend[E]) => void
  ): this
}
/**
 * {@link https://github.com/subframe7536/typesafe-electron-ipc#in-renderer example}
 */
export interface TypedIpcRenderer<
  T extends IpcSchema,
  MainSend extends Record<string, any[]> = MS<T>,
  RendererSend extends Record<string, any[]> = RS<T>,
  RendererFetch extends Record<string, { params: any[]; return: any }> = RF<T>,
> {
  invoke<E extends keyof RendererFetch>(channel: E, ...args: RendererFetch[E]['params']): Promise<RendererFetch[E]['return']>
  on<E extends keyof MainSend>(
    channel: E,
    listener: (event: IpcRendererEvent, ...args: MainSend[E]) => void
  ): VoidFunction
  once<E extends keyof MainSend>(
    channel: E,
    listener: (event: IpcRendererEvent, ...args: MainSend[E]) => void
  ): this
  send<E extends keyof RendererSend>(channel: E, ...args: RendererSend[E]): void
  sendToHost<E extends keyof RendererSend>(channel: E, ...args: RendererSend[E]): void
  removeAllListeners(channel: keyof MainSend): this
  removeListener<E extends keyof MainSend>(
    channel: E,
    listener: (event: IpcRendererEvent, ...args: MainSend[E]) => void
  ): this
  postMessage(channel: string, message: any, transfer?: MessagePort[]): void
}

export interface TypedEventEmitter<
  T extends Record<string | symbol, ParseParameters<any>>,
  Events extends Extract<keyof T, string | symbol> = Extract<keyof T, string | symbol>,
> extends NodeJS.EventEmitter {
  addListener<E extends Events>(eventName: E, listener: ParseFunction<T[E]>): this
  removeListener<E extends Events>(eventName: E, listener: ParseFunction<T[E]>): this
  removeAllListeners<E extends Events>(event?: E): this
  setMaxListeners(n: number): this
  getMaxListeners(): number
  listeners<E extends Events>(eventName: E): Function[]
  rawListeners<E extends Events>(eventName: E): Function[]
  listenerCount<E extends Events>(eventName: E, listener?: Function): number
  prependListener<E extends Events>(eventName: E, listener: ParseFunction<T[E]>): this
  prependOnceListener<E extends Events>(eventName: E, listener: ParseFunction<T[E]>): this
  eventNames(): Events[]
}
