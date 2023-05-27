import { fetchIpcFn, generateTypesafeIpc, mainSendIpcFn, rendererSendIpcFn } from 'typesafe-electron-ipc'

const state = {
  msg: fetchIpcFn<string, string>('channel::msg'),
  front: rendererSendIpcFn<{ test: number }>('channel::front'),
  back: mainSendIpcFn<boolean>('channel::back'),
}
const fn = generateTypesafeIpc(state)
export const main = fn.main
export const renderer = fn.renderer
export const channels = fn.channels
