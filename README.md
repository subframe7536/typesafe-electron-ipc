## typesafe electron ipc

auto generate typesafe ipc functions for electron

### usage

#### preload.ts

expose by contextBridge.exposeInMainWorld

```typescript
const state = {
  msg: fetchIpcFn<string, string>('msg'),
  front: rendererSendIpcFn<{ test: number }>('front'),
  back: mainSendIpcFn<boolean>('back'),
}
export const {
  main,
  renderer,
  clearListeners,
  channels
} = generateTypesafeIpc(state)
```

#### main.ts

```typescript
main.msg((_, data) => {
  console.log(data)
  console.log(channels)
  return 'return from main'
})
```

#### renderer.ts

```typescript
export async function fetch() {
  console.log(await renderer.msg('fetch from renderer'))
}
```

### example

see [playground](./playground)