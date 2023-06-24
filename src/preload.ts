import { contextBridge } from 'electron'
import type { SetupItem, TypesafeIpcRenderer } from './types'

export function exposeIPC(modules: TypesafeIpcRenderer<SetupItem>) {
  const { channels, clearListeners, renderer } = modules
  contextBridge.exposeInMainWorld('__renderer', renderer)
  contextBridge.exposeInMainWorld('__channels', channels)
  contextBridge.exposeInMainWorld('__clearListeners', clearListeners)
}
