import type { BrowserWindow, Event, IpcMain, IpcRenderer } from 'electron'
import type { ParseFunction, ParseParameters, Prettify } from '@subframe7536/type-utils'

type ReceiveFn<Data, CallbackReturn, Return> = (callback: (_e: Event, ...data: ParseParameters<Data>) => CallbackReturn) => Return

export type RendererInvokeFn<Data, Return> = (...data: ParseParameters<Data>) => Return
export type MainHandleFn<Data, Return> = ReceiveFn<Data, Return, void>

export type RendererSendFn<Data> = (...data: ParseParameters<Data>) => void
export type MainSendFn<Data> = (win: BrowserWindow, ...data: ParseParameters<Data>) => void

export type RendererOnFn<Data> = ReceiveFn<Data, void, IpcRenderer>
export type MainOnFn<Data> = ReceiveFn<Data, void, IpcMain>

export type RendererIpcFn =
  | RendererInvokeFn<any, any>
  | RendererOnFn<any>
  | RendererSendFn<any>
export type MainIpcFn =
  | MainHandleFn<any, any>
  | MainOnFn<any>
  | MainSendFn<any>

export type IpcFn<T, K, C extends string | undefined = string> = {
  renderer: T
  main: K
  channel?: C
}
export type GenericIpcFn = IpcFn<RendererIpcFn, MainIpcFn>

export type SetupItem<K = GenericIpcFn> = {
  [key: string]: K | SetupItem<K>
}

export type Channel<Module extends SetupItem, Path extends string = ''> = Prettify<{
  [Item in keyof Module & string]: Module[Item] extends GenericIpcFn
    ? Module[Item]['channel'] extends string
      ? Module[Item]['channel']
      : `${Path}${Path extends '' ? '' : '::'}${Item}`
    : Module[Item] extends SetupItem
      ? Channel<Module[Item], `${Path}${Path extends '' ? '' : '::'}${Item}`>
      : never
}>

type IpcFunction<
  Module extends SetupItem,
  P extends 'main' | 'renderer',
> = {
  [Item in keyof Module]: Module[Item] extends GenericIpcFn
    ? Module[Item][P]
    : Module[Item] extends SetupItem
      ? IpcFunction<Module[Item], P>
      : never
}

type TypesafeIpc<Module extends SetupItem> = {
  channels: Channel<Module>
  clearListeners: (channel: string) => void
}

export type TypesafeIpcMain<M extends SetupItem> = TypesafeIpc<M> & {
  main: IpcFunction<M, 'main'>
}
export type TypesafeIpcRenderer<M extends SetupItem> = TypesafeIpc<M> & {
  renderer: IpcFunction<M, 'renderer'>
}

export interface TypesafeEventEmitter<
  T extends Record<string | symbol, ParseParameters<any>>,
  Events extends Extract<keyof T, string | symbol> = Extract<keyof T, string | symbol>,
> extends NodeJS.EventEmitter {
  addListener<E extends Events> (eventName: E, listener: ParseFunction<T[E]>): this
  removeListener<E extends Events> (eventName: E, listener: ParseFunction<T[E]>): this
  removeAllListeners<E extends Events> (event?: E): this
  setMaxListeners(n: number): this
  getMaxListeners(): number
  listeners<E extends Events> (eventName: E): Function[]
  rawListeners<E extends Events> (eventName: E): Function[]
  listenerCount<E extends Events> (eventName: E, listener?: Function): number
  prependListener<E extends Events> (eventName: E, listener: ParseFunction<T[E]>): this
  prependOnceListener<E extends Events> (eventName: E, listener: ParseFunction<T[E]>): this
  eventNames(): Events[]
  on<E extends Events>(eventName: E, listener: ParseFunction<T[E]>): this
  once<E extends Events>(eventName: E, listener: ParseFunction<T[E]>): this
  emit<E extends Events>(eventName: E, ...args: ParseParameters<T[E]>): boolean
  off<E extends Events>(eventName: E, listener: ParseFunction<T[E]>): this
}