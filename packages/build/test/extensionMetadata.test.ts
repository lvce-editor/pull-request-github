import { packageExtension } from '@lvce-editor/package-extension'
import assert from 'node:assert/strict'
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { root } from '../src/root.ts'

test('packages the release version and extension description', async (t) => {
  const testDir = await mkdtemp(join(tmpdir(), 'pull-request-github-metadata-'))
  t.after(async () => {
    await rm(testDir, { force: true, recursive: true })
  })
  const inDir = join(testDir, 'extension')
  await mkdir(inDir)
  const manifestPath = join(inDir, 'extension.json')
  await copyFile(join(root, 'packages', 'pull-requests-github', 'extension.json'), manifestPath)

  await packageExtension({
    env: { RG_VERSION: 'v1.2.3' },
    inDir,
    outFile: join(testDir, 'extension.tar.br'),
    writeLastUpdatedFromGitCommit: false,
  })

  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  assert.equal(manifest.version, '1.2.3')
  assert.equal(manifest.description, 'Create and review GitHub pull requests in the editor.')
})
