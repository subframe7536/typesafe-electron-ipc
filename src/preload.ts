import { contextBridge } from 'electron'
import type { IpcExposeName, SetupItem, TypesafeIpcRenderer } from './types'

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
