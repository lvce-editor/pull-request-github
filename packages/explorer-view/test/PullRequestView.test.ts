import { afterEach, expect, jest, test } from '@jest/globals'
import { create } from '../src/parts/PullRequestView/PullRequestView.ts'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
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
  globalThis.fetch = jest.fn(async () => {
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
  }) as typeof fetch

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
