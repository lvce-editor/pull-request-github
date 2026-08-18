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

test('ships the pull requests view icon', async () => {
  const extensionPath = join(root, 'packages', 'pull-requests-github')
  const manifestContent = await readFile(join(extensionPath, 'extension.json'), 'utf8')
  const manifest = JSON.parse(manifestContent)
  const iconPath = manifest.views.find((view: { id?: string }) => view.id === 'github.pullRequests')?.icon
  const iconContent = await readFile(join(extensionPath, iconPath), 'utf8')

  match(iconContent, /^<svg\b/)
})
