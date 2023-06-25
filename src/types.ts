import type { BrowserWindow, Event, IpcMain, IpcRenderer } from 'electron'

export type Promisable<T> = T | Promise<T>
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
type ParseArray<T, P = [T]> = T extends any[]
  ? T['length'] extends 1
    ? [data: T[0]]
    : T
  : T extends number | bigint | string | symbol | boolean | object
    ? ParseArray<P>
    : []

type ReceiveFn<Data, CallbackReturn, Return> = (callback: (_e: Event, ...data: ParseArray<Data>) => CallbackReturn) => Return

export type RendererInvokeFn<Data, Return> = (...data: ParseArray<Data>) => Return
export type MainHandleFn<Data, Return> = ReceiveFn<Data, Return, void>

export type RendererSendFn<Data> = (...data: ParseArray<Data>) => void
export type MainSendFn<Data> = (win: BrowserWindow, ...data: ParseArray<Data>) => void

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

export type Channel<Module extends SetupItem, Path extends string = ''> = {
  [Item in keyof Module]: Module[Item] extends GenericIpcFn
    ? Module[Item]['channel'] extends string
      ? Module[Item]['channel']
      : `${Path}${Path extends '' ? '' : '::'}${Extract<Item, string>}`
    : Module[Item] extends SetupItem
      ? Prettify<Channel<Module[Item], `${Path}${Path extends '' ? '' : '::'}${Extract<Item, string>}`>>
      : never
}

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
  T extends Record<string | symbol, ParseArray<any>>,
  Event extends Extract<keyof T, string | symbol> = Extract<keyof T, string | symbol>,
> extends NodeJS.EventEmitter {
  addListener<E extends Event> (eventName: E, listener: (...args: ParseArray<T[E]>) => void): this
  removeListener<E extends Event> (eventName: E, listener: (...args: ParseArray<T[E]>) => void): this
  removeAllListeners<E extends Event> (event?: E): this
  setMaxListeners(n: number): this
  getMaxListeners(): number
  listeners<E extends Event> (eventName: E): Function[]
  rawListeners<E extends Event> (eventName: E): Function[]
  listenerCount<E extends Event> (eventName: E, listener?: Function): number
  prependListener<E extends Event> (eventName: E, listener: (...args: ParseArray<T[E]>) => void): this
  prependOnceListener<E extends Event> (eventName: E, listener: (...args: ParseArray<T[E]>) => void): this
  eventNames(): (Event)[]
  on<E extends Event>(eventName: E, listener: (...data: ParseArray<T[E]>) => void): this
  once<E extends Event>(eventName: E, listener: (...args: ParseArray<T[E]>) => void): this
  emit<E extends Event>(eventName: E, ...args: ParseArray<T[E]>): boolean
  off<E extends Event>(eventName: E, listener: (...args: ParseArray<T[E]>) => void): this
}

export type IpcExposeName = {
  [k in keyof TypesafeIpcRenderer<any>]?: string
}
