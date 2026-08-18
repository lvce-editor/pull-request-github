import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { bundleJs } from '../src/bundleJs.ts'

test('view worker uses host-managed rpc for the github worker', async (t) => {
  const outDir = await mkdtemp(join(tmpdir(), 'pull-request-github-build-'))
  t.after(async () => {
    await rm(outDir, { force: true, recursive: true })
  })

  await bundleJs(outDir)

  const viewWorker = await readFile(join(outDir, 'pullRequestWorkerMain.js'), 'utf8')
  assert.doesNotMatch(viewWorker, /new Worker\(/)
  assert.match(viewWorker, /Extensions\.createWebViewWorkerRpc2/)
})
