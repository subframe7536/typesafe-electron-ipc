import { fetchIpcFn, mainSendIpcFn, rendererSendIpcFn } from 'typesafe-electron-ipc'

export const state = {
  msg: fetchIpcFn<string, string>('channel::msg'),
  front: rendererSendIpcFn<{ test: number }>('channel::front'),
  back: mainSendIpcFn<boolean>('channel::back'),
}
