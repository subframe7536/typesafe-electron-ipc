import type { IpcExposeName, SetupItem, TypesafeIpcRenderer } from './types'

export function loadIPC<T extends SetupItem>(option?: IpcExposeName): TypesafeIpcRenderer<T> {
  return {
    renderer: option?.renderer ?? globalThis.__electron_renderer,
    channels: option?.channels ?? globalThis.__electron_channels,
    clearListeners: option?.clearListeners ?? globalThis.__electron_clearListeners,
  }
}
