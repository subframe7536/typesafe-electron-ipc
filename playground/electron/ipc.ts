import type { IpcSchemaOf } from 'typesafe-electron-ipc/define'

import { defineIpcSchema, mainSend, rendererFetch, rendererSend } from 'typesafe-electron-ipc/define'

export const ipcSchema = defineIpcSchema({
  ipcTest: {
    msg: rendererFetch<string, string>(),
    front: rendererSend<[test: { test: number }, stamp: number]>(),
    back: mainSend<boolean>(),
    no: rendererSend(),
    test: {
      deep: rendererFetch<undefined, string>(),
    },
  },
  another: rendererFetch<{ a: number } | { b: string }, string>(),
})

export type IpcSchema = IpcSchemaOf<typeof ipcSchema>
