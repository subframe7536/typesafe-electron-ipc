import type { BrowserWindow, IpcMain, IpcRenderer } from 'electron'

export type Promisable<T> = T | Promise<T>
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

export type IpcFn<T, K, C extends string = string> = {
  renderer: T
  main: K
  channel: C
}

export type SetupObject = Record<string, IpcFn<RendererIpcFn, MainIpcFn>>

export type TypesafeRendererIpc<T extends SetupObject> = {
  renderer: {
    [K in keyof T]: T[K]['renderer']
  }
  channels: {
    [K in keyof T]: T[K]['channel']
  }
  clearListeners: (channel: T[keyof T]['channel']) => void
}
export type TypesafeMainIpc<T extends SetupObject> = {
  main: {
    [K in keyof T]: T[K]['main']
  }
  channels: {
    [K in keyof T]: T[K]['channel']
  }
  clearListeners: (channel?: T[keyof T]['channel']) => void
}
