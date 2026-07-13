import assert from 'node:assert/strict'
import test from 'node:test'
import { githubPagesPath } from '../src/githubPagesPath.ts'

test('uses the repository name as the GitHub Pages path', () => {
  assert.equal(githubPagesPath, '/pull-request-github')
})
