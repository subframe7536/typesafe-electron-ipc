import { ipcRenderer, ipcMain, BrowserWindow } from 'electron'
import type { RendererInvokeFn, MainHandleFn, Promisable, RendererOnFn, MainSendFn, RendererSendFn, MainOnFn, IpcFn } from './types'

export function fetchIpcFn<Data, Return = Data, Channel extends string = string>(c: Channel): IpcFn<
  RendererInvokeFn<Data, Promise<Return>>,
  MainHandleFn<Data, Promisable<Return>>,
  Channel
> {
  return {
    channel: c,
    renderer: ipcRenderer?.invoke.bind(ipcRenderer, c),
    main: ipcMain?.handle.bind(ipcMain, c),
  }
}
export function fetchOnceIpcFn<Data, Return = Data, Channel extends string = string>(c: Channel): IpcFn<
  RendererInvokeFn<Data, Promise<Return>>,
  MainHandleFn<Data, Promisable<Return>>,
  Channel
> {
  return {
    channel: c,
    renderer: ipcRenderer?.invoke.bind(ipcRenderer, c),
    main: ipcMain?.handleOnce.bind(ipcMain, c),
  }
}
export function mainSendIpcFn<Data, Channel extends string = string>(c: Channel): IpcFn<
  RendererOnFn<Data>,
  MainSendFn<Data>,
  Channel
> {
  return {
    channel: c,
    main: (win: BrowserWindow, data: any) => {
      console.log(win.id)
      win.webContents.send(c, data)
    },
    renderer: ipcRenderer?.on.bind(ipcRenderer, c),
  }
}
export function mainSendOnceIpcFn<Data, Channel extends string = string>(c: Channel): IpcFn<
  RendererOnFn<Data>,
  MainSendFn<Data>,
  Channel
> {
  return {
    channel: c,
    main: (win: BrowserWindow, data: any) => {
      win.webContents.send(c, data)
    },
    renderer: ipcRenderer?.once.bind(ipcRenderer, c),
  }
}
export function rendererSendIpcFn<Data, Channel extends string = string>(c: Channel): IpcFn<
  RendererSendFn<Data>,
  MainOnFn<Data>,
  Channel
> {
  return {
    channel: c,
    main: ipcMain?.on.bind(ipcMain, c),
    renderer: ipcRenderer?.send.bind(ipcRenderer, c),
  }
}
export function rendererSendOnceIpcFn<Data, Channel extends string = string>(c: Channel): IpcFn<
  RendererSendFn<Data>,
  MainOnFn<Data>,
  Channel
> {
  return {
    channel: c,
    main: ipcMain?.once.bind(ipcMain, c),
    renderer: ipcRenderer?.send.bind(ipcRenderer, c),
  }
}