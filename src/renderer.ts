import type { IpcSchema, TypedIpcRenderer } from './types'

/**
 * create typesafe `ipcRenderer`
 * @param name custom global key
 * @see {@link https://github.com/subframe7536/typesafe-electron-ipc#in-renderer example}
 */
export function useIpcRenderer<T extends IpcSchema>(
  name = '__ipcRenderer',
): TypedIpcRenderer<T> {
  return globalThis[name]
}

export function useElectron<T>(key: string): T {
  return globalThis[key]
}
