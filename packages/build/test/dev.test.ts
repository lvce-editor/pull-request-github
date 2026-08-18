import { deepEqual, match } from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { getServerArgs } from '../src/getServerArgs.ts'
import { root } from '../src/root.ts'

test('loads the development extension', () => {
  deepEqual(getServerArgs(), [
    'node_modules/@lvce-editor/server/bin/server.js',
    '--only-extension=packages/pull-requests-github',
    '--test-path=packages/e2e',
  ])
})

test('writes the development bundle next to the extension manifest', async () => {
  const content = await readFile(join(root, 'package.json'), 'utf8')
  const packageJson = JSON.parse(content)

  match(packageJson.scripts['build:watch'], /--outdir=packages\/pull-requests-github\/dist(?:\s|$)/)
})
