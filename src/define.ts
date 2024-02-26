import type { DrainOuterGeneric, IsEmptyObject, RemoveNeverProps } from '@subframe7536/type-utils'

/**
 * `ipcMain.send` & `ipcRenderer.on`
 */
export type MainSend<T = null> = {
  '__ipc-MainSend-RendererOn': T
}
/**
 * `ipcMain.on` & `ipcRenderer.send`
 */
export type RendererSend<T = null> = {
  '__ipc-RendererSend-MainOn': T
}
/**
 * `ipcMain.handle` & `ipcRenderer.invoke`
 */
export type RendererFetch<T = null, P = null> = {
  '__ipc-RendererInvoke-MainHandle': [T, P]
}
type FilterEmptyProps<T> = RemoveNeverProps<{
  [K in keyof T]: IsEmptyObject<T[K]> extends true ? never : T[K];
}>
type Channels<
  T,
  Sep extends string,
  Path extends string = '',
> = DrainOuterGeneric<{
  [K in keyof T]: T[K] extends MainSend<any> | RendererSend<any> | RendererFetch<any, any>
    ? Path extends ''
      ? K & string
      : `${Path}${Sep}${K & string}`
    : Channels<
        T[K],
        Sep,
        `${Path}${Path extends '' ? '' : Sep}${K & string}`
      >;
}[keyof T]>

type FilterIpcFn<T> = DrainOuterGeneric<FilterEmptyProps<{
  [K in keyof T]: T[K] extends MainSend<any> | RendererSend<any> | RendererFetch<any, any>
    ? T[K]
    : FilterIpcFn<T[K]>;
}>>
type PathValue<T, P extends string, Sep extends string> = P extends `${infer Key}${Sep}${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest, Sep>
    : never
  : P extends keyof T
    ? T[P]
    : never

/**
 * define ipc schema
 * @example
 * import type { DefineIpcSchema, MainSend, RendererFetch, RendererSend } from 'typesafe-electron-ipc/define'
 *
 * export type IpcSchema = DefineIpcSchema<{
 *   ipcTest: {
 *     msg: RendererFetch<string, string>
 *     front: RendererSend<[test: { test: number }, stamp: number]>
 *     back: MainSend<boolean>
 *     no: RendererSend
 *     test: {
 *       deep: RendererFetch<undefined, string>
 *     }
 *   }
 *   another: RendererFetch<{ a: number } | { b: string }, string>
 * }, '::'> // ==> chars that combine the key path, '::' by default, customable
 */
export type DefineIpcSchema<T, Sep extends string = '::'> = {
  [K in Channels<FilterIpcFn<T>, Sep>]: PathValue<T, K, Sep>
}
