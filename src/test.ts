import { fetchIpcFn, mainSendIpcFn, rendererSendIpcFn } from './utils'
import { generateTypesafeIpcModule } from '.'

export const ipcModules = {
  ipcTest: {
    msg: fetchIpcFn<string, string>(),
    front: rendererSendIpcFn<{ test: number }>(),
    back: mainSendIpcFn<boolean>(),
  },
}

const test = generateTypesafeIpcModule(ipcModules, 'main')
const channels = test.channels
const main = test.main
