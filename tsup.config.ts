import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/renderer.ts',
    'src/types.ts',
  ],
  clean: true,
  format: ['cjs', 'esm'],
  shims: true,
  dts: true,
  treeshake: true,
  external: ['electron'],
})
