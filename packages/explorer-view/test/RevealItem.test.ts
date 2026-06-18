import { test, expect } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExplorerState } from '../src/parts/ExplorerState/ExplorerState.ts'
import { createDefaultState } from '../src/parts/CreateDefaultState/CreateDefaultState.ts'
import { revealItem } from '../src/parts/RevealItem/RevealItem.ts'

test('revealItem - item not found', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes'() {
      return []
    },
  })

  const state = createDefaultState()
  const newState = await revealItem(state, 'test')
  expect(newState.items).toEqual([])
  expect(mockRpc.invocations).toEqual([])
})

test('revealItem - uri outside root', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes'() {
      return []
    },
  })

  const state: ExplorerState = {
    ...createDefaultState(),
    root: '/root',
  }
  const newState = await revealItem(state, 'non-existent:///some-file.txt')
  expect(newState).toEqual(state)
  expect(mockRpc.invocations).toEqual([])
})

test('revealItem - item found', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.readDirWithFileTypes'() {
      return []
    },
  })

  const state: ExplorerState = {
    ...createDefaultState(),
    items: [
      {
        depth: 0,
        name: 'test',
        path: 'test',
        selected: false,
        type: 1,
      },
    ],
  }
  const newState = await revealItem(state, 'test')
  expect(newState.items[0].path).toBe('test')
  expect(mockRpc.invocations).toEqual([])
})
