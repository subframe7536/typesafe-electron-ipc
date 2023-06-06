import { fetchIpcFn, mainSendIpcFn, rendererSendIpcFn } from 'typesafe-electron-ipc'

export const ipcModules = {
  ipcTest: {
    msg: fetchIpcFn<string, string>('msg'),
    front: rendererSendIpcFn<[test: { test: number }, stamp: number]>(),
    back: mainSendIpcFn<boolean>(),
    test: {
      deep: fetchIpcFn<number, string>(),
    },
  },
  another: fetchIpcFn<string, string>(),
}
