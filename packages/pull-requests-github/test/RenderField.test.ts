import { expect, test } from '@jest/globals'
import { renderField } from '../src/parts/RenderField/RenderField.ts'

test('renderField renders label and value', () => {
  const dom = renderField('Title', 'Add feature')

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        childCount: 2,
        className: 'PullRequestField',
      }),
      expect.objectContaining({
        className: 'PullRequestFieldLabel',
      }),
      expect.objectContaining({
        text: 'Title',
      }),
      expect.objectContaining({
        className: 'PullRequestFieldValue',
      }),
      expect.objectContaining({
        text: 'Add feature',
      }),
    ]),
  )
})

test('renderField renders placeholder for empty value', () => {
  const dom = renderField('Description', '')

  expect(dom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        text: 'Description',
      }),
      expect.objectContaining({
        text: '-',
      }),
    ]),
  )
})
