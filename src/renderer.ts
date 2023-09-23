import type { SetupItem, TypesafeIpcRenderer } from './types'

/**
 * load exposed IPC
 * @param name custom expose name
 */
export function loadIPC<T extends SetupItem>(name = '__electron_ipc'): TypesafeIpcRenderer<T> {
  return loadMain(name)
}

export function loadMain<T>(key: string): T {
  return globalThis[key]
}
