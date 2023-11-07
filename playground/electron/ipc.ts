import type { DefineIpcSchema, MainSend, RendererFetch, RendererSend } from 'typesafe-electron-ipc/define'

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
