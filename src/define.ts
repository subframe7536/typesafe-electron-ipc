/* eslint-disable symbol-description */
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

type UtilFns = MainSend<any> | RendererSend<any> | RendererFetch<any, any>

type FilterEmptyProps<T> = RemoveNeverProps<{
  [K in keyof T]: IsEmptyObject<T[K]> extends true ? never : T[K];
}>

type Channels<
  T,
  Sep extends string,
  Path extends string = '',
> = DrainOuterGeneric<{
  [K in keyof T]: T[K] extends UtilFns
    ? Path extends '' ? K & string : `${Path}${Sep}${K & string}`
    : Channels<T[K], Sep, `${Path}${Path extends '' ? '' : Sep}${K & string}`>
}[keyof T]>

type FilterIpcFn<T> = DrainOuterGeneric<FilterEmptyProps<{
  [K in keyof T]: T[K] extends UtilFns
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

type BuildChannels<T, Sep extends string, Path extends string = ''> = {
  [K in keyof T]: T[K] extends UtilFns
    ? `${Path}${Path extends '' ? '' : Sep}${K & string}`
    : BuildChannels<T[K], Sep, `${Path}${Path extends '' ? '' : Sep}${K & string}`>;
}

type IpcSchemaResult<T, Sep extends string = '::'> = BuildChannels<T, Sep> & {
  readonly '~ipc': DefineIpcSchema<T, Sep>
}

export type IpcSchemaOf<T> = T extends { ['~ipc']?: infer S } ? S : never

const SCHEMA_SYMBOL = Symbol()

export function rendererFetch<T = null, P = null>(): RendererFetch<T, P> {
  return SCHEMA_SYMBOL as unknown as RendererFetch<T, P>
}

export function rendererSend<T = null>(): RendererSend<T> {
  return SCHEMA_SYMBOL as unknown as RendererSend<T>
}

export function mainSend<T = null>(): MainSend<T> {
  return SCHEMA_SYMBOL as unknown as MainSend<T>
}

/**
 * Util to create IpcSchema, get its key and types
 * @param schema Schema object
 * @param sep separator, default to `::`
 * @returns Schema key object and types
 * @example
 * import { defineIpcSchema, mainSend, rendererFetch, rendererSend } from 'typesafe-electron-ipc/define'
 *
 * export const ipcSchema = defineIpcSchema({
 *   ipcTest: {
 *     msg: rendererFetch<string, string>(),
 *     front: rendererSend<[test: { test: number }, stamp: number]>(),
 *     back: mainSend<boolean>(),
 *     no: rendererSend(),
 *     test: {
 *       deep: rendererFetch<undefined, string>(),
 *     },
 *   },
 *   another: rendererFetch<{ a: number } | { b: string }, string>(),
 * })
 * ipcSchema.ipcTest.test.deep
 * // ipcTest::test::deep
 * typeof ipcSchema['~ipc'] // type only property
 * // DefineIpcSchema<{
 * //   ipcTest: {
 * //     msg: RendererFetch<string, string>
 * //     front: RendererSend<[test: { test: number }, stamp: number]>
 * //     back: MainSend<boolean>
 * //     no: RendererSend
 * //     test: {
 * //       deep: RendererFetch<undefined, string>
 * //     }
 * //   }
 * //   another: RendererFetch<{ a: number } | { b: string }, string>
 * // }, '::'>
 */
export function defineIpcSchema<
  T extends object,
  Sep extends string = '::',
>(schema: T, sep: Sep = '::' as Sep): IpcSchemaResult<T, Sep> {
  const result = {}
  const queue = [[schema, '', result]]

  while (queue.length > 0) {
    const [parent, path, target] = queue.pop()!

    const keys = Object.keys(parent)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const val = parent[key]

      const currentPath = path ? path + sep + key : key

      if (val && typeof val === 'object') {
        const nested = {}
        target[key] = nested
        queue.push([val, currentPath, nested])
      } else if (val === SCHEMA_SYMBOL) {
        target[key] = currentPath
      }
    }
  }

  return result as unknown as IpcSchemaResult<T, Sep>
}
