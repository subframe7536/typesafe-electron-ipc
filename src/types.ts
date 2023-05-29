import type { BrowserWindow, IpcMain, IpcRenderer } from 'electron'

export type Promisable<T> = T | Promise<T>
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type ReceiveFn<Data, CallbackReturn, Return> = (callback: (_: any, data: Data) => CallbackReturn) => Return

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

export type IpcFn<T, K> = {
  renderer: T
  main: K
}

export type SetupItem = Record<string, IpcFn<RendererIpcFn, MainIpcFn>>

export type SetupModule = Record<string, SetupItem>

type Channel<Module extends SetupModule> = Prettify<{
  [Item in keyof Module]: {
    [Key in keyof Module[Item]]: `${Extract<Item, string>}::${Extract<Key, string>}`
  }
}>

type IpcFunction<Module extends SetupModule, P extends 'main' | 'renderer'> = Prettify<{
  [Item in keyof Module]: {
    [Key in keyof Module[Item]]: Module[Item][Key][P]
  }
}>

type TypesafeIpc<Module extends SetupModule> = {
  channels: Channel<Module>
  clearListeners: (channel: string) => void
}

export type TypesafeIpcMain<M extends SetupModule> = TypesafeIpc<M> & {
  main: IpcFunction<M, 'main'>
}
export type TypesafeIpcRenderer<M extends SetupModule> = TypesafeIpc<M> & {
  renderer: IpcFunction<M, 'renderer'>
}
