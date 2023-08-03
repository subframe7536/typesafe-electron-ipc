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

export function pathSet(object: any, path: string, value: any) {
  let current = object
  const pathParts = path.split('.')

  for (let i = 0; i < pathParts.length; i++) {
    const key = pathParts[i]

    if (i === pathParts.length - 1) {
      current[key] = value
    } else {
      if (!current[key]) {
        current[key] = {}
      }
      current = current[key]
    }
  }
}

/**
 * expose IPC to renderer
 * @param modules predefined ipc modules
 * @param option custom expose name
 */
export function exposeIPC(modules: SetupItem, name = '__electron') {
  const { channels, clearListeners, renderer } = generateTypesafeIPC(modules, 'renderer')
  const ipc = {
    renderer,
    channels,
    clearListeners,
  }
  exposeMain(name, ipc)
}

export function exposeMain(key: string, value: any) {
  contextBridge.exposeInMainWorld(key, value)
}
