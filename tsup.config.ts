import { rmSync } from 'node:fs'
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
  outExtension({ format }) {
    return {
      js: `.${format === 'esm' ? 'mjs' : format}`,
    }
  },
  plugins: [
    {
      name: 'rm',
      buildEnd({ writtenFiles }) {
        for (const { name } of writtenFiles) {
          if (name.includes('types')) {
            rmSync(name)
            break
          }
        }
      },
    },
  ],
})
