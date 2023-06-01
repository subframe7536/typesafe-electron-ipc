import type { IpcFn, MainHandleFn, MainOnFn, MainSendFn, Promisable, RendererInvokeFn, RendererOnFn, RendererSendFn } from './types'

/**
 * renderer -> main
 * ipcRenderer.invoke & ipcMain.handle
 */
export function fetchIpcFn<Data, Return = Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
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
export function fetchOnceIpcFn<Data, Return = Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
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
export function mainSendIpcFn<Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
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
export function mainSendOnceIpcFn<Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
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
export function rendererSendIpcFn<Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
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
export function rendererSendOnceIpcFn<Data, Channel extends string | undefined = string>(channel?: Channel): IpcFn<
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
