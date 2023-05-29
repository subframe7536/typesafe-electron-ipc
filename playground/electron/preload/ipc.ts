import { fetchIpcFn, mainSendIpcFn, rendererSendIpcFn } from 'typesafe-electron-ipc'

export const ipcModules = {
  ipcTest: {
    msg: fetchIpcFn<string, string>(),
    front: rendererSendIpcFn<{ test: number }>(),
    back: mainSendIpcFn<boolean>(),
  },
}
