import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/renderer.ts',
    'src/define.ts',
  ],
  format: ['cjs', 'esm'],
  fixedExtension: true,
  dts: {
    resolve: true,
    isolatedDeclarations: true,
  },
  external: ['electron'],
})
