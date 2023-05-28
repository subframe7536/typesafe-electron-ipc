## typesafe electron ipc

auto generate typesafe ipc functions for electron

### usage

#### in shared

```typescript
const state = {
  msg: fetchIpcFn<string, string>('msg'),
  front: rendererSendIpcFn<{ test: number }>('front'),
  back: mainSendIpcFn<boolean>('back'),
}
```

#### preload.ts

```typescript
const {
  renderer,
  clearListeners,
  channels
} = generateTypesafeIpc(state, 'renderer')
contextBridge.exposeInMainWorld('renderer', renderer)
```

#### main.ts

```typescript
const {
  main,
  clearListeners,
  channels
} = generateTypesafeIpc(state, 'main')
main.msg((_, data) => { // data: string
  console.log(data)
  console.log(channels)
  return 'return from main'
})
```

#### renderer.ts

```typescript
export async function fetch() {
  const msg = await window.renderer.msg('fetch from renderer')
  console.log(msg) // msg: string
}
```

### example

see in [playground](./playground)