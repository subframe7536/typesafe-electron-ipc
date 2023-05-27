import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  format: ['cjs', 'esm'],
  shims: true,
  dts: true,
  treeshake: true,
  external: ['electron'],
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'mjs' : format}`,
    }
  },
})
