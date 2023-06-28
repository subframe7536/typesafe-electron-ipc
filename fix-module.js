const { relative, join } = require('node:path/posix')
const { writeFileSync, mkdirSync, rmSync } = require('node:fs')
const { exports: exp } = require('./package.json')

rmSync('./dist/types.js')
rmSync('./dist/types.mjs')
rmSync('./dist/types.d.mts')
writeFileSync('types.d.ts', 'export * from \'./dist/types\'')

const ROOT_PATH = __dirname
const exportMap = exp

for (const ex of Object.keys(exportMap)) {
  if (ex === '.' || !exportMap[ex].require) {
    continue
  }

  const [, ...folders] = ex.split('/')
  const fileName = folders.pop()

  const [, ...targetFolders] = exportMap[ex].require.split('/')
  const targetFileName = targetFolders.pop()
  const target = relative(
    join(ROOT_PATH, ...folders),
    join(ROOT_PATH, ...targetFolders, targetFileName),
  )

  mkdirSync(join(ROOT_PATH, ...folders), {
    recursive: true,
  })

  writeFileSync(
    join(ROOT_PATH, ...folders, `${fileName}.js`),
    `module.exports = require('./${target}')`,
  )

  writeFileSync(
    join(ROOT_PATH, ...folders, `${fileName}.d.ts`),
    `export * from './${target.split('.')[0]}'`,
  )
}
