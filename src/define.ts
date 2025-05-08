/* eslint-disable symbol-description */
import type { IpcFn, MainSend, RendererFetch, RendererSend } from './types'
import type {
  DrainOuterGeneric,
  IsEmptyObject,
  RemoveNeverProps,
  UnionToIntersection,
} from '@subframe7536/type-utils'

export type { MainSend, RendererFetch, RendererSend } from './types'

type FilterEmptyProps<T> = RemoveNeverProps<{
  [K in keyof T]: IsEmptyObject<T[K]> extends true ? never : T[K];
}>

type SchemaKey<T extends string, P extends IpcFn> = T & { '~ipc': P }

/**
 * Convert `{ a: { b: MainSend<string> } }` to `{ a: { b: 'a::b' & { '~ipc': MainSend<string>} } }`
 */
type ChannelMap<T, Sep extends string, Path extends string = ''> = DrainOuterGeneric<FilterEmptyProps<{
  [K in keyof T]: T[K] extends IpcFn
    ? SchemaKey<`${Path}${Path extends '' ? '' : Sep}${K & string}`, T[K]>
    : T[K] extends Record<string, unknown>
      ? ChannelMap<T[K], Sep, `${Path}${Path extends '' ? '' : Sep}${K & string}`>
      : never
}>>

type ExtractIpcValues<T> = T extends SchemaKey<infer S, infer V>
  ? { [Key in S & string]: V }
  : T extends object
    ? { [K in keyof T]: ExtractIpcValues<T[K]> }[keyof T]
    : never

type RemoveSchemaKey<T> = T extends SchemaKey<infer S, any>
  ? S
  : T extends object
    ? { [K in keyof T]: RemoveSchemaKey<T[K]> }
    : never

type IpcSchemaResult<T, Sep extends string> = ChannelMap<T, Sep> extends infer S
  ? RemoveSchemaKey<S> & { readonly '~ipc': UnionToIntersection<ExtractIpcValues<S>> }
  : never

export type IpcSchemaOf<T> = T extends { ['~ipc']?: infer S } ? S : never

/**
 * Define type-only ipc schema
 * @example
 * ```ts
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
 * ```
 */
export type DefineIpcSchema<T, Sep extends string = '::'> = IpcSchemaOf<IpcSchemaResult<T, Sep>>

const SCHEMA_SYMBOL = Symbol()

/**
 * Helper that indicate `ipcMain.handle` & `ipcRenderer.invoke`
 *
 * `T` is the data that `ipcRenderer.invoke` called, `ipcMain.handle` received
 *
 * `P` is the data that `ipcRenderer.invoke` returned, `ipcMain.handle` sent
 */
export function rendererFetch<T = null, P = null>(): RendererFetch<T, P> {
  return SCHEMA_SYMBOL as unknown as RendererFetch<T, P>
}

/**
 * Helper that indicate `ipcMain.on` & `ipcRenderer.send`
 *
 * `T` is the data that `ipcMain.on` received
 */
export function rendererSend<T = null>(): RendererSend<T> {
  return SCHEMA_SYMBOL as unknown as RendererSend<T>
}

/**
 * Helper that indicate `ipcMain.send` & `ipcRenderer.on`
 *
 * `T` is the data that `ipcRenderer.on` received
 */
export function mainSend<T = null>(): MainSend<T> {
  return SCHEMA_SYMBOL as unknown as MainSend<T>
}

/**
 * Util to create IpcSchema, get its key and types
 * @param schema Schema object
 * @param sep Separator, default to `::`
 * @returns Schema key object and types
 * @example
 * ```ts
 * import { defineIpcSchema, mainSend, rendererFetch, rendererSend } from 'typesafe-electron-ipc/define'
 *
 * export const MSG = defineIpcSchema({
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
 * MSG.ipcTest.test.deep
 * // ipcTest::test::deep
 * typeof MSG['~ipc'] // type only property
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
 * ```
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
