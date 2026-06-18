import { expect, test } from '@jest/globals'
import { renderPullRequest } from '../src/parts/RenderPullRequest/RenderPullRequest.ts'

test('renderPullRequest renders pull request fields', () => {
  const dom = renderPullRequest({
    baseBranch: 'main',
    description: 'description',
    headBranch: 'feature',
    title: 'Add feature',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        childCount: 4,
        className: 'PullRequestDetails',
      }),
      expect.objectContaining({
        text: 'Title',
      }),
      expect.objectContaining({
        text: 'Add feature',
      }),
      expect.objectContaining({
        text: 'Head',
      }),
      expect.objectContaining({
        text: 'feature',
      }),
      expect.objectContaining({
        text: 'Base',
      }),
      expect.objectContaining({
        text: 'main',
      }),
      expect.objectContaining({
        text: 'Description',
      }),
      expect.objectContaining({
        text: 'description',
      }),
    ]),
  )
})

test('renderPullRequest renders default description', () => {
  const dom = renderPullRequest({
    baseBranch: 'main',
    description: '',
    headBranch: 'feature',
    title: 'Add feature',
  })

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        text: 'No description',
      }),
    ]),
  )
})
