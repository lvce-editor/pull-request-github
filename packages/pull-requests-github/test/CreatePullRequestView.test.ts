import { expect, jest, test } from '@jest/globals'
import type { Dependencies } from '../src/parts/CreatePullRequestDependencies/CreatePullRequestDependencies.ts'
import { create } from '../src/parts/CreatePullRequestView/CreatePullRequestView.ts'

const defaults = { baseBranch: 'main', headBranch: 'feature', remoteUrl: 'git@github.com:owner/repo.git', title: 'Add feature' }
const created = { number: 42, url: 'https://github.com/owner/repo/pull/42' }
const setup = (
  overrides: Readonly<Partial<Dependencies>> = {},
): { request: ReturnType<typeof jest.fn<Dependencies['request']>>; view: ReturnType<typeof create> } => {
  const request = jest.fn<Dependencies['request']>().mockResolvedValueOnce(created).mockResolvedValue({ autoMerge: true })
  const dependencies = {
    getDefaults: async (): Promise<typeof defaults> => defaults,
    getToken: async (): Promise<string> => 'lvce-token',
    request,
    ...overrides,
  }
  const view = create(async () => {}, dependencies)
  return { request, view }
}
const getRenderedText = (view: Readonly<ReturnType<typeof create>>): string =>
  view
    .render()
    .map((node) => node.text || '')
    .join(' ')

test('uses commit title, accepts empty description, creates and enables squash exactly once', async () => {
  const { request, view } = setup()
  await view.initialize()
  expect(view.render().find((node) => node.name === 'title')?.value).toBe('Add feature')
  view.input('title', 'Edited title')
  await view.submit()
  await view.submit()
  expect(request.mock.calls).toEqual([
    ['lvce-token', '', { base: 'main', description: '', head: 'feature', repository: 'owner/repo', title: 'Edited title' }],
    ['lvce-token', '/auto-merge', { number: 42, repository: 'owner/repo' }],
  ])
  expect(getRenderedText(view)).toContain('Auto-squash enabled')
})
test('retries only auto-merge after partial success', async () => {
  const request = jest
    .fn<Dependencies['request']>()
    .mockResolvedValueOnce(created)
    .mockRejectedValueOnce(new Error('Auto-merge disabled'))
    .mockResolvedValueOnce({ autoMerge: true })
  const { view } = setup({ request })
  await view.initialize()
  await view.submit()
  expect(getRenderedText(view)).toContain('Pull request created, but auto-squash failed')
  view.input('title', 'cannot change submitted title')
  await view.submit()
  expect(request.mock.calls.map((call: Readonly<Parameters<Dependencies['request']>>) => call[1])).toEqual(['', '/auto-merge', '/auto-merge'])
})
test.each(['base', 'head', 'title'])('rejects empty %s without a request', async (name: string) => {
  const { request, view } = setup()
  await view.initialize()
  view.input(name, '  ')
  await view.submit()
  expect(request).not.toHaveBeenCalled()
  expect(getRenderedText(view)).toContain('are required')
})
test('rejects identical branches and preserves description', async () => {
  const { request, view } = setup()
  await view.initialize()
  view.input('description', 'line 1\nline 2')
  view.input('head', 'main')
  await view.submit()
  expect(request).not.toHaveBeenCalled()
  expect(getRenderedText(view)).toContain('must be different')
  expect(view.render().find((node) => node.name === 'description')?.value).toBe('line 1\nline 2')
})
test('signed out never sends a request', async () => {
  const { request, view } = setup({ getToken: async () => '' })
  await view.initialize()
  await view.submit()
  expect(request).not.toHaveBeenCalled()
  expect(getRenderedText(view)).toContain('Sign in')
})
test.each(['No workspace', 'Detached HEAD', 'No commits', 'Git unavailable'])('shows initialization error %s', async (message) => {
  const { request, view } = setup({
    getDefaults: async () => {
      throw new Error(message)
    },
  })
  await view.initialize()
  expect(getRenderedText(view)).toContain(message)
  expect(request).not.toHaveBeenCalled()
})
test('rejects non-GitHub remote', async () => {
  const { view } = setup({ getDefaults: async () => ({ ...defaults, remoteUrl: 'git@gitlab.com:owner/repo.git' }) })
  await view.initialize()
  expect(getRenderedText(view)).toContain('not hosted on GitHub')
})
test('gets missing default branch from authenticated repository API', async () => {
  const request = jest.fn<Dependencies['request']>().mockResolvedValue({ defaultBranch: 'develop' })
  const { view } = setup({ getDefaults: async () => ({ ...defaults, baseBranch: '' }), request })
  await view.initialize()
  expect(view.render().find((node) => node.name === 'base')?.value).toBe('develop')
  expect(request).toHaveBeenCalledWith('lvce-token', '/repository?repository=' + encodeURIComponent('owner/repo'))
})
test('ignores double submission and input during a pending mutation', async () => {
  const deferred = Promise.withResolvers<unknown>()
  const request = jest
    .fn<Dependencies['request']>()
    .mockImplementationOnce(() => deferred.promise)
    .mockResolvedValue({ autoMerge: true })
  const { view } = setup({ request })
  await view.initialize()
  const pending = view.submit()
  await Promise.resolve()
  await Promise.resolve()
  expect(view.canCancel()).toBe(false)
  view.input('title', 'changed')
  await view.submit()
  deferred.resolve(created)
  await pending
  expect(request).toHaveBeenCalledTimes(2)
  expect(view.render().find((node) => node.name === 'title')?.value).toBe('Add feature')
})
test('dispose during creation prevents a subsequent auto-merge write', async () => {
  const request = jest.fn<Dependencies['request']>().mockImplementation(async () => {
    view.dispose()
    return created
  })
  const { view } = setup({ request })
  await view.initialize()
  await view.submit()
  await view.submit()
  expect(request).toHaveBeenCalledTimes(1)
})
test.each([{}, { number: 0 }, { number: 42, url: 'https://evil.example' }])(
  'rejects malformed creation response %j',
  async (response: Readonly<Record<string, unknown>>) => {
    const request = jest.fn<Dependencies['request']>().mockResolvedValue(response)
    const { view } = setup({ request })
    await view.initialize()
    await view.submit()
    expect(getRenderedText(view)).toContain('Invalid pull request response')
    expect(request).toHaveBeenCalledTimes(1)
  },
)

test('closing the view during authentication prevents PR creation', async () => {
  const token = Promise.withResolvers<string>()
  const { request, view } = setup({ getToken: () => token.promise })
  await view.initialize()
  const pending = view.submit()
  await Promise.resolve()
  view.dispose()
  token.resolve('lvce-token')
  await pending
  expect(request).not.toHaveBeenCalled()
})
