import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.ts'

export const enableConcurrentExtensionRerenders = (content: string): string => {
  const marker = '// src/parts/ViewletExtensionView/ViewletExtensionView.ipc.ts'
  const start = content.indexOf(marker)
  const end = content.indexOf('});', start)
  if (start === -1 || end === -1) throw new Error('Missing extension view runtime exports')
  const exports = content.slice(start, end)
  const replacement = 'concurrentCommands: () => ["rerender"],'
  if (exports.includes(replacement)) return content
  if (exports.includes('concurrentCommands:')) throw new Error('Unexpected extension view concurrent commands')
  const pattern = /serializeCommands: \(\) => [\w$]+,/
  if (!pattern.test(exports)) throw new Error('Missing extension view command serialization')
  // A handler may await a rerender of its intermediate state. Queueing that render
  // behind the handler deadlocks; retain serialization for every other command.
  const updated = exports.replace(pattern, (match) => `${match}\n  ${replacement}`)
  return content.slice(0, start) + updated + content.slice(end)
}

export const configureRuntime = async (): Promise<void> => {
  const staticRoot = join(root, 'node_modules', '@lvce-editor', 'static-server', 'static')
  let configured = 0
  for (const entry of await readdir(staticRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[a-f0-9]{7,40}$/.test(entry.name)) continue
    const workerPath = join(staticRoot, entry.name, 'packages', 'renderer-worker', 'dist', 'rendererWorkerMain.js')
    const content = await readFile(workerPath, 'utf8')
    const updated = enableConcurrentExtensionRerenders(content)
    if (updated !== content) await writeFile(workerPath, updated)
    configured++
  }
  if (!configured) throw new Error('Missing installed renderer worker')
}
