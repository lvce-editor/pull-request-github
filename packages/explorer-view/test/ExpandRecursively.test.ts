import { test, expect } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { ExplorerState } from '../src/parts/ExplorerState/ExplorerState.ts'
import { createDefaultState } from '../src/parts/CreateDefaultState/CreateDefaultState.ts'
import { Directory, File } from '../src/parts/DirentType/DirentType.ts'
import { expandRecursively } from '../src/parts/ExpandRecursively/ExpandRecursively.ts'

test.skip('expand root directory', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.getPathSeparator'() {
      return '/'
    },
    'FileSystem.readDirWithFileTypes'() {
      return [
        { isSymbolicLink: false, name: 'file1.txt', type: 'file' },
        { isSymbolicLink: false, name: 'dir1', type: 'directory' },
      ]
    },
    'IconTheme.getFileIcon'() {
      return 'file-icon'
    },
    'IconTheme.getFolderIcon'() {
      return 'folder-icon'
    },
  })
  const state: ExplorerState = {
    ...createDefaultState(),
    focusedIndex: 0,
    items: [
      { depth: 0, name: 'file1.txt', path: '/test/file1.txt', selected: false, type: File },
      { depth: 0, name: 'dir1', path: '/test/dir1', selected: false, type: Directory },
    ],
    root: '/test',
  }
  const newState = await expandRecursively(state)
  expect(newState.items).toHaveLength(2)
  expect(newState.items[0].name).toBe('file1.txt')
  expect(newState.items[1].name).toBe('dir1')
  expect(mockRpc.invocations).toEqual([])
})

test.skip('expand focused directory', async () => {
  using mockRpc = RendererWorker.registerMockRpc({
    'FileSystem.getPathSeparator'() {
      return '/'
    },
    'FileSystem.readDirWithFileTypes'() {
      return [
        { isSymbolicLink: false, name: 'file1.txt', type: 'file' },
        { isSymbolicLink: false, name: 'file2.txt', type: 'file' },
      ]
    },
    'IconTheme.getFileIcon'() {
      return 'file-icon'
    },
    'IconTheme.getFolderIcon'() {
      return 'folder-icon'
    },
  })
  const state: ExplorerState = {
    ...createDefaultState(),
    focusedIndex: 0,
    items: [
      { depth: 0, name: 'dir1', path: '/test/dir1', selected: false, type: Directory },
      { depth: 0, name: 'file1.txt', path: '/test/file1.txt', selected: false, type: File },
    ],
  }
  const newState = await expandRecursively(state)
  expect(newState.items).toHaveLength(2)
  expect(newState.items[0].name).toBe('file1.txt')
  expect(newState.items[1].name).toBe('file2.txt')
  expect(mockRpc.invocations).toEqual([])
})

test('do not expand file', async () => {
  const state: ExplorerState = {
    ...createDefaultState(),
    focusedIndex: 0,
    items: [
      {
        depth: 0,
        name: 'test.txt',
        path: '/test.txt',
        selected: false,
        type: File,
      },
    ],
  }
  const newState = await expandRecursively(state)
  expect(newState.items).toHaveLength(1)
  expect(newState.items[0].type).toBe(File)
})
