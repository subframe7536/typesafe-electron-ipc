import type { IpcFn, MainHandleFn, MainOnFn, MainSendFn, Promisable, RendererInvokeFn, RendererOnFn, RendererSendFn } from './types'

/**
 * renderer -> main
 * ipcRenderer.invoke & ipcMain.handle
 */
export function fetchIpcFn<Data, Return = Data>(): IpcFn<
  RendererInvokeFn<Data, Promise<Return>>,
  MainHandleFn<Data, Promisable<Return>>
> {
  return {
    renderer: 'invoke' as any,
    main: 'handle' as any,
  }
}

/**
 * renderer -> main
 * ipcRenderer.invoke & ipcMain.handleOnce
 */
export function fetchOnceIpcFn<Data, Return = Data>(): IpcFn<
  RendererInvokeFn<Data, Promise<Return>>,
  MainHandleFn<Data, Promisable<Return>>
> {
  return {
    renderer: 'invoke' as any,
    main: 'handleOnce' as any,
  }
}
/**
 * main -> renderer
 * ipcRenderer.on & BrowserWindow.webContents.send
 */
export function mainSendIpcFn<Data>(): IpcFn<
  RendererOnFn<Data>,
  MainSendFn<Data>
> {
  return {
    main: 'send' as any,
    renderer: 'on' as any,
  }
}
/**
 * main -> renderer
 * ipcRenderer.once & BrowserWindow.webContents.send
 */
export function mainSendOnceIpcFn<Data>(): IpcFn<
  RendererOnFn<Data>,
  MainSendFn<Data>
> {
  return {
    main: 'send' as any,
    renderer: 'once' as any,
  }
}
/**
 * renderer -> main
 * ipcRenderer.send & ipcMain.on
 */
export function rendererSendIpcFn<Data>(): IpcFn<
  RendererSendFn<Data>,
  MainOnFn<Data>
> {
  return {
    main: 'on' as any,
    renderer: 'send' as any,
  }
}
/**
 * renderer -> main
 * ipcRenderer.send & ipcMain.once
 */
export function rendererSendOnceIpcFn<Data>(): IpcFn<
  RendererSendFn<Data>,
  MainOnFn<Data>
> {
  return {
    main: 'once' as any,
    renderer: 'send' as any,
  }
}
