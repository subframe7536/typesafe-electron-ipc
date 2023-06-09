import { contextBridge } from 'electron'
import type { IpcExposeName, IpcFn, MainHandleFn, MainOnFn, MainSendFn, Promisable, RendererInvokeFn, RendererOnFn, RendererSendFn, SetupItem, TypesafeIpcRenderer } from './types'

/**
 * renderer -> main
 * ipcRenderer.invoke & ipcMain.handle
 */
export function fetchIpcFn<Data = void, Return = Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
  RendererInvokeFn<Data, Promise<Return>>,
  MainHandleFn<Data, Promisable<Return>>,
  Channel
> {
  return {
    channel,
    renderer: 'invoke' as any,
    main: 'handle' as any,
  }
}

/**
 * renderer -> main
 * ipcRenderer.invoke & ipcMain.handleOnce
 */
export function fetchOnceIpcFn<Data = void, Return = Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
  RendererInvokeFn<Data, Promise<Return>>,
  MainHandleFn<Data, Promisable<Return>>,
  Channel
> {
  return {
    channel,
    renderer: 'invoke' as any,
    main: 'handleOnce' as any,
  }
}
/**
 * main -> renderer
 * ipcRenderer.on & BrowserWindow.webContents.send
 */
export function mainSendIpcFn<Data = void, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
  RendererOnFn<Data>,
  MainSendFn<Data>,
  Channel
> {
  return {
    channel,
    main: 'send' as any,
    renderer: 'on' as any,
  }
}
/**
 * main -> renderer
 * ipcRenderer.once & BrowserWindow.webContents.send
 */
export function mainSendOnceIpcFn<Data = void, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
  RendererOnFn<Data>,
  MainSendFn<Data>,
  Channel
> {
  return {
    channel,
    main: 'send' as any,
    renderer: 'once' as any,
  }
}
/**
 * renderer -> main
 * ipcRenderer.send & ipcMain.on
 */
export function rendererSendIpcFn<Data = void, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
  RendererSendFn<Data>,
  MainOnFn<Data>,
  Channel
> {
  return {
    channel,
    main: 'on' as any,
    renderer: 'send' as any,
  }
}
/**
 * renderer -> main
 * ipcRenderer.send & ipcMain.once
 */
export function rendererSendOnceIpcFn<Data = void, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
  RendererSendFn<Data>,
  MainOnFn<Data>,
  Channel
> {
  return {
    channel,
    main: 'once' as any,
    renderer: 'send' as any,
  }
}
/**
 * expose IPC to renderer
 * @param modules predefined ipc modules
 * @param option custom expose name
 */
export function exposeIPC(modules: TypesafeIpcRenderer<SetupItem>, option?: IpcExposeName) {
  const { channels, clearListeners, renderer } = modules
  contextBridge.exposeInMainWorld(option?.renderer ?? '__electron_renderer', renderer)
  contextBridge.exposeInMainWorld(option?.channels ?? '__electron_channels', channels)
  contextBridge.exposeInMainWorld(option?.clearListeners ?? '__electron_clearListeners', clearListeners)
}
