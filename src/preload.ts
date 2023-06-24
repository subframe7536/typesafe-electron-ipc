import { contextBridge } from 'electron'
import type { IpcExposeName, SetupItem, TypesafeIpcRenderer } from './types'

export function exposeIPC(modules: TypesafeIpcRenderer<SetupItem>, option?: IpcExposeName) {
  const { channels, clearListeners, renderer } = modules
  contextBridge.exposeInMainWorld(option?.renderer ?? '__electron_renderer', renderer)
  contextBridge.exposeInMainWorld(option?.channels ?? '__electron_channels', channels)
  contextBridge.exposeInMainWorld(option?.clearListeners ?? '__electron_clearListeners', clearListeners)
}
