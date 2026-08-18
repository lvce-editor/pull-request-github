import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { bundleJs } from './bundleJs.ts'
import { root } from './root.ts'

const outDir = join(root, 'packages', 'pull-requests-github', 'dist')

await rm(outDir, { force: true, recursive: true })
await mkdir(outDir, { recursive: true })
await bundleJs(outDir)
