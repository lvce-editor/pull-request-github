import type { GitHubRepository } from '@lvce-editor/pull-request-shared'
import { getWorkspaceUri, readFile } from '@lvce-editor/api'
import { getRemoteUrl, parseGitHubRemoteUrl } from '../GitRemote/GitRemote.ts'

// cspell:ignore commondir gitdir

type GetWorkspaceUri = () => Promise<string>
type ReadFile = (uri: string) => Promise<string>

const protocolRegex = /^[a-z][a-z\d+.-]*:/i

const removeTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

const joinUri = (base: string, path: string): string => {
  return `${removeTrailingSlash(base)}/${path}`
}

const resolveGitDirectory = (workspaceUri: string, value: string): string => {
  const gitDirectory = value.trim()
  if (protocolRegex.test(gitDirectory)) {
    return removeTrailingSlash(gitDirectory)
  }
  if (gitDirectory.startsWith('/')) {
    return workspaceUri.startsWith('file:') ? `file://${gitDirectory}` : gitDirectory
  }
  if (protocolRegex.test(workspaceUri)) {
    return removeTrailingSlash(new URL(gitDirectory, `${removeTrailingSlash(workspaceUri)}/`).href)
  }
  return joinUri(workspaceUri, gitDirectory)
}

const readGitConfig = async (workspaceUri: string, read: ReadFile): Promise<string> => {
  const dotGitUri = joinUri(workspaceUri, '.git')
  try {
    return await read(joinUri(dotGitUri, 'config'))
  } catch {
    let dotGitFile: string
    try {
      dotGitFile = await read(dotGitUri)
    } catch {
      throw new Error('No Git repository was found in the current workspace.')
    }
    const gitDirectoryLine = dotGitFile.split('\n').find((line) => line.trimStart().startsWith('gitdir:'))
    if (!gitDirectoryLine) {
      throw new Error('No Git repository was found in the current workspace.')
    }
    const gitDirectory = resolveGitDirectory(workspaceUri, gitDirectoryLine.slice(gitDirectoryLine.indexOf(':') + 1))
    try {
      return await read(joinUri(gitDirectory, 'config'))
    } catch {
      try {
        const commonDirectory = await read(joinUri(gitDirectory, 'commondir'))
        return await read(joinUri(resolveGitDirectory(gitDirectory, commonDirectory), 'config'))
      } catch {
        throw new Error('No Git repository was found in the current workspace.')
      }
    }
  }
}

export const getGitHubRepository = async (getWorkspace: GetWorkspaceUri = getWorkspaceUri, read: ReadFile = readFile): Promise<GitHubRepository> => {
  const workspaceUri = await getWorkspace()
  if (!workspaceUri) {
    throw new Error('Open a folder containing a GitHub repository to view pull requests.')
  }
  const config = await readGitConfig(workspaceUri, read)
  const remoteUrl = getRemoteUrl(config)
  if (!remoteUrl) {
    throw new Error('No Git remote was found in the current workspace.')
  }
  const repository = parseGitHubRemoteUrl(remoteUrl)
  if (!repository) {
    throw new Error('The current repository remote is not hosted on GitHub.')
  }
  return repository
}
