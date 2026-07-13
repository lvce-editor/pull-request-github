import { afterEach, expect, jest, test } from '@jest/globals'
import { create, openActiveInstance, refreshActiveInstance } from '../src/parts/PullRequestView/PullRequestView.ts'

afterEach(() => {
  jest.restoreAllMocks()
})

test('create renders saved url', () => {
  const view = create({
    state: {
      url: 'https://github.com/owner/repo/pull/1',
    },
  })

  const dom = view.render()
  expect(dom.some((node) => node.value === 'https://github.com/owner/repo/pull/1')).toBe(true)
  expect(view.saveState()).toEqual({
    url: 'https://github.com/owner/repo/pull/1',
  })
})

test('handleEvent updates url from input', async () => {
  const view = create()
  await view.handleEvent({
    name: 'pullRequestUrl',
    type: 'input',
    value: 'https://github.com/owner/repo/pull/2',
  })

  expect(view.saveState()).toEqual({
    url: 'https://github.com/owner/repo/pull/2',
  })
})

test('handleEvent loads pull request on button click', async () => {
  jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    return {
      json: async () => ({
        base: {
          ref: 'main',
        },
        body: 'description',
        head: {
          ref: 'feature',
        },
        title: 'Add feature',
      }),
      ok: true,
      status: 200,
    } as Response
  })

  const view = create()
  await view.handleEvent({
    name: 'pullRequestUrl',
    type: 'input',
    value: 'https://github.com/owner/repo/pull/2',
  })
  await view.handleEvent({
    name: 'loadPullRequest',
    type: 'click',
  })

  const dom = view.render()
  expect(dom.some((node) => node.text === 'Add feature')).toBe(true)
})

test('handleEvent renders error on invalid submit', async () => {
  const view = create()
  await view.handleEvent({
    type: 'submit',
  })

  const dom = view.render()
  expect(dom.some((node) => node.text === 'Enter a valid GitHub pull request URL')).toBe(true)
})

test('refreshActiveInstance reloads the current pull request', async () => {
  const requestRerender = jest.fn<() => Promise<void>>().mockResolvedValue()
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
    return {
      json: async () => ({
        base: { ref: 'main' },
        body: 'updated description',
        head: { ref: 'feature' },
        title: 'Updated title',
      }),
      ok: true,
      status: 200,
    } as Response
  })
  const view = create({
    requestRerender,
    showContextMenu: jest.fn<() => Promise<void>>().mockResolvedValue(),
    state: {
      url: 'https://github.com/owner/repo/pull/3',
    },
    uid: 1,
    viewId: 'github.pullRequests',
  })

  await refreshActiveInstance()

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(requestRerender).toHaveBeenCalledTimes(2)
  expect(view.render().some((node) => node.text === 'Updated title')).toBe(true)
  view.dispose()
})

test('openOnGitHub opens the current pull request url', async () => {
  const open = jest.fn<(url: string) => Promise<void>>().mockResolvedValue()
  const view = create({
    requestRerender: jest.fn<() => Promise<void>>().mockResolvedValue(),
    showContextMenu: jest.fn<() => Promise<void>>().mockResolvedValue(),
    state: {
      url: 'https://github.com/owner/repo/pull/4',
    },
    uid: 1,
    viewId: 'github.pullRequests',
  })

  await openActiveInstance(open)

  expect(open).toHaveBeenCalledWith('https://github.com/owner/repo/pull/4')
  view.dispose()
})
