import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { bundleJs } from '../src/bundleJs.ts'

test('bundles separate view and github workers', async (t) => {
  const outDir = await mkdtemp(join(tmpdir(), 'pull-request-github-build-'))
  t.after(async () => {
    await rm(outDir, { force: true, recursive: true })
  })

  await bundleJs(outDir)

  const viewWorker = await readFile(join(outDir, 'pullRequestWorkerMain.js'), 'utf8')
  const githubWorker = await readFile(join(outDir, 'githubWorkerMain.js'), 'utf8')
  assert.doesNotMatch(viewWorker, /new Worker\(/)
  assert.doesNotMatch(viewWorker, /application\/vnd\.github\+json/)
  assert.match(viewWorker, /Extensions\.createWebViewWorkerRpc2/)
  assert.match(githubWorker, /application\/vnd\.github\+json/)
  assert.match(githubWorker, /GitHub\.fetchPullRequest/)
  assert.match(githubWorker, /GitHub\.fetchPullRequests/)
})
