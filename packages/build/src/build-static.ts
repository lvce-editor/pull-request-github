import { cp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { githubPagesPath } from './githubPagesPath.ts'
import { root } from './root.ts'

const sharedProcessPath = join(root, 'node_modules', '@lvce-editor', 'shared-process', 'index.js')

const sharedProcessUrl = pathToFileURL(sharedProcessPath).toString()

const sharedProcess = await import(sharedProcessUrl)

const extensionId = 'github.pull-requests'

process.env.PATH_PREFIX = githubPagesPath
const { commitHash } = await sharedProcess.exportStatic({
  root,
  extensionPath: 'packages/pull-requests-github',
  testPath: 'packages/e2e',
})

const staticExtensionPath = join(root, 'dist', commitHash, 'extensions', extensionId)
await cp(join(root, '.tmp', 'dist'), staticExtensionPath, { recursive: true, force: true })

const extensionJsonPath = join(staticExtensionPath, 'extension.json')
const extensionJson = JSON.parse(await readFile(extensionJsonPath, 'utf8'))
if (extensionJson.id !== extensionId || typeof extensionJson.browser !== 'string' || !extensionJson.browser) {
  throw new Error(`Expected ${extensionJsonPath} to define the ${extensionId} browser extension`)
}
await readFile(join(staticExtensionPath, extensionJson.browser))

const webExtensionsPath = join(root, 'dist', commitHash, 'config', 'webExtensions.json')
const webExtensions = JSON.parse(await readFile(webExtensionsPath, 'utf8'))
if (!webExtensions.some((extension: { id?: string }) => extension.id === extensionId)) {
  throw new Error(`Expected ${webExtensionsPath} to include ${extensionId}`)
}

const rendererWorkerPath = join(root, 'dist', commitHash, 'packages', 'renderer-worker', 'dist', 'rendererWorkerMain.js')

export const getRemoteUrl = (path: string): string => {
  const url = pathToFileURL(path).toString().slice(8)
  return `/remote/${url}`
}

const content = await readFile(rendererWorkerPath, 'utf8')
const workerPath = join(root, '.tmp/dist/dist/pullRequestWorkerMain.js')
const remoteUrl = getRemoteUrl(workerPath)

const occurrence = `// const pullRequestsGithubWorkerUrl = \`\${assetDir}/packages/pull-requests-github-worker/dist/pullRequestsGithubViewWorkerMain.js\`
const pullRequestsGithubWorkerUrl = \`${remoteUrl}\``
const replacement = `const pullRequestsGithubWorkerUrl = \`\${assetDir}/packages/pull-requests-github-worker/dist/pullRequestsGithubViewWorkerMain.js\``
if (content.includes(occurrence)) {
  const newContent = content.replace(occurrence, replacement)
  await writeFile(rendererWorkerPath, newContent)
}

await cp(join(root, 'dist'), join(root, '.tmp', 'static'), { recursive: true })
