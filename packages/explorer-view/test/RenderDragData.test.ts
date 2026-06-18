import { expect, test } from '@jest/globals'
import type { ExplorerState } from '../src/parts/ExplorerState/ExplorerState.js'
import { createDefaultState } from '../src/parts/CreateDefaultState/CreateDefaultState.js'
import { renderDragData } from '../src/parts/RenderDragData/RenderDragData.js'

test('renderDragData - no items', () => {
  const oldState: ExplorerState = createDefaultState()
  const newState: ExplorerState = {
    ...oldState,
    focusedIndex: 0,
    items: [],
    uid: 123,
  }
  const result = renderDragData(oldState, newState)
  expect(result).toEqual(['Viewlet.setDragData', 123, expect.anything()])
})
