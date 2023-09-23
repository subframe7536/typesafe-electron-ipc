import { contextBridge } from 'electron'
import type { IpcFn, MainHandleFn, MainOnFn, MainSendFn, Promisable, RendererInvokeFn, RendererOnFn, RendererSendFn, SetupItem } from './types'
import { generateTypesafeIPC } from '.'

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
    // invoke
    renderer: 0 as any,
    // handle
    main: 1 as any,
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
    // invoke
    renderer: 0 as any,
    // handleOnce
    main: 3 as any,
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
    // on
    renderer: 2 as any,
    // send
    main: 0 as any,
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
    // once
    renderer: 3 as any,
    // send
    main: 0 as any,
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
    // send
    renderer: 1 as any,
    // on
    main: 3 as any,
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
    // send
    renderer: 1 as any,
    // once
    main: 4 as any,
  }
}

/**
 * expose IPC to renderer
 * @param modules predefined ipc modules
 * @param option custom expose name
 */
export function exposeIPC(modules: SetupItem, name = '__electron_ipc') {
  const ipc = generateTypesafeIPC(modules, 'renderer')
  exposeMain(name, ipc)
}

export function exposeMain(key: string, value: any) {
  contextBridge.exposeInMainWorld(key, value)
}
