import type { SetupItem, TypesafeIpcRenderer } from './types'

export function loadIPC<T extends SetupItem>(): TypesafeIpcRenderer<T> {
  return {
    renderer: globalThis.__renderer,
    channels: globalThis.__channels,
    clearListeners: globalThis.__clearListeners,
  }
}
