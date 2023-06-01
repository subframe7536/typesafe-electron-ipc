import type { BrowserWindow, IpcMain, IpcRenderer } from 'electron'

export type Promisable<T> = T | Promise<T>
type ReceiveFn<Data, CallbackReturn, Return> = (callback: (_: any, data: Data) => CallbackReturn) => Return

export type RendererInvokeFn<Data, Return> = (data: Data) => Return
export type MainHandleFn<Data, Return> = ReceiveFn<Data, Return, void>

export type RendererSendFn<Data> = (data: Data) => void
export type MainSendFn<Data> = (win: BrowserWindow, data: Data) => void

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

type Channel<Module extends SetupItem, Path extends string = ''> = {
  [Item in keyof Module]: Module[Item] extends GenericIpcFn
    ? Module[Item]['channel'] extends string
      ? Module[Item]['channel']
      : `${Path}${Path extends '' ? '' : '::'}${Extract<Item, string>}`
    : Module[Item] extends SetupItem
      ? Channel<Module[Item], `${Path}${Path extends '' ? '' : '::'}${Extract<Item, string>}`>
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
