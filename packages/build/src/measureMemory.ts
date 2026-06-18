import { measureMemory } from '@lvce-editor/measure-memory'
import { join } from 'node:path'
import { root } from './root.ts'

const threshold = 570_000

const instantiations = 9000

const instantiationsPath = join(root, 'packages', 'explorer-view')

const workerPath = join(root, '.tmp/dist/dist/explorerViewWorkerMain.js')

const playwrightPath = import.meta.resolve('../../e2e/node_modules/playwright/index.mjs')

await measureMemory({
  playwrightPath,
  workerPath,
  threshold,
  instantiations,
  instantiationsPath,
})
