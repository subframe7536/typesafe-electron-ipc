import type { DefineIpcSchema, MainSend, RendererFetch, RendererSend } from 'typesafe-electron-ipc/define'
import type { SerializerOptions } from 'typesafe-electron-ipc'

// import { encode, decode } from '@ygoe/msgpack';

export type IpcSchema = DefineIpcSchema<{
  ipcTest: {
    msg: RendererFetch<string, string>
    front: RendererSend<[test: { test: number }, stamp: number]>
    back: MainSend<boolean>
    no: RendererSend
    test: {
      deep: RendererFetch<undefined, string>
    }
  }
  another: RendererFetch<{ a: number } | { b: string }, string>
}>
