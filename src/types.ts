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
export interface TypedIpcMain<
  T extends IpcSchema,
  MainSend extends Record<string, any[]> = MS<T>,
  RendererSend extends Record<string, any[]> = RS<T>,
  RendererFetch extends Record<string, { params: any[], return: any }> = RF<T>,
> {
  send<E extends StringKeys<MainSend>>(win: BrowserWindow, channel: E, ...args: MainSend[E]): void
  handle<E extends StringKeys<RendererFetch>>(
    channel: E,
    listener: (event: IpcMainInvokeEvent, ...args: RendererFetch[E]['params']) => Promisable<RendererFetch[E]['return']>
  ): VoidFunction
  handleOnce<E extends StringKeys<RendererFetch>>(
    channel: E,
    listener: (event: IpcMainInvokeEvent, ...args: RendererFetch[E]['params']) => Promisable<RendererFetch[E]['return']>
  ): void
  on<E extends StringKeys<RendererSend>>(
    channel: E,
    listener: (event: IpcMainEvent, ...args: RendererSend[E]) => void
  ): VoidFunction
  once<E extends StringKeys<RendererSend>>(
    channel: E,
    listener: (event: IpcMainEvent, ...args: RendererSend[E]) => void
  ): void
  removeAllListeners(channel?: StringKeys<RendererSend>): void
  removeHandler(channel: StringKeys<RendererFetch>): void
}
/**
 * {@link https://github.com/subframe7536/typesafe-electron-ipc#in-renderer example}
 */
export interface TypedIpcRenderer<
  T extends IpcSchema,
  MainSend extends Record<string, any[]> = MS<T>,
  RendererSend extends Record<string, any[]> = RS<T>,
  RendererFetch extends Record<string, { params: any[], return: any }> = RF<T>,
> {
  invoke<E extends StringKeys<RendererFetch>>(channel: E, ...args: RendererFetch[E]['params']): Promise<RendererFetch[E]['return']>
  on<E extends StringKeys<MainSend>>(
    channel: E,
    listener: (event: IpcRendererEvent, ...args: MainSend[E]) => void
  ): VoidFunction
  once<E extends StringKeys<MainSend>>(
    channel: E,
    listener: (event: IpcRendererEvent, ...args: MainSend[E]) => void
  ): void
  send<E extends StringKeys<RendererSend>>(channel: E, ...args: RendererSend[E]): void
  sendToHost<E extends StringKeys<RendererSend>>(channel: E, ...args: RendererSend[E]): void
  removeAllListeners(channel: StringKeys<MainSend>): void
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
