import type { SetupItem, TypesafeIpcRenderer } from './types'

/**
 * load exposed IPC
 * @param option custom expose name
 */
export function loadIPC<T extends SetupItem>(name = '__electron_ipc'): TypesafeIpcRenderer<T> {
  return loadMain(name)
}

export function loadMain<T = any>(key: string): T {
  return globalThis[key as string]
}
