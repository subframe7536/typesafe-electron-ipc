const { existsSync, rmSync } = require('node:fs')
const { concurrently } = require('concurrently')

existsSync('dist') && rmSync('dist', { recursive: true })

const { result } = concurrently([
  'npx tsc -p tsconfig.cjs.json',
  'npx tsc -p tsconfig.esm.json',
])
result.then(() => {
  rmSync('dist/cjs/types.js')
  rmSync('dist/esm/types.js')
  console.log('build success')
})
