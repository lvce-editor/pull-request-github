import type { GitHubRepository } from '@lvce-editor/pull-request-shared'

const remoteSectionRegex = /^\s*\[remote\s+"([^"]+)"\]\s*$/
const scpRemoteRegex = /^(?:[^@\s]+@)?([^:\s]+):([^\s]+)$/
const sectionRegex = /^\s*\[/
const newLineRegex = /\r?\n/

export const getRemoteUrl = (config: string, preferredRemote = 'origin'): string | undefined => {
  let currentRemote = ''
  let firstRemoteUrl: string | undefined
  for (const line of config.split(newLineRegex)) {
    const remoteMatch = line.match(remoteSectionRegex)
    if (remoteMatch) {
      currentRemote = remoteMatch[1]
      continue
    }
    if (sectionRegex.test(line)) {
      currentRemote = ''
      continue
    }
    if (!currentRemote) {
      continue
    }
    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1 || line.slice(0, equalsIndex).trim() !== 'url') {
      continue
    }
    const url = line.slice(equalsIndex + 1).trim()
    if (currentRemote === preferredRemote) {
      return url
    }
    firstRemoteUrl ||= url
  }
  return firstRemoteUrl
}

const normalizeRepositoryName = (value: string): string => {
  return value.endsWith('.git') ? value.slice(0, -4) : value
}

const isGitHubHostname = (value: string): boolean => {
  const hostname = value.toLowerCase()
  return hostname === 'github.com' || hostname.endsWith('.github.com')
}

const fromPath = (path: string): GitHubRepository | undefined => {
  const parts = path.split('/').filter(Boolean)
  if (parts.length !== 2) {
    return undefined
  }
  const name = normalizeRepositoryName(parts[1])
  if (!parts[0] || !name) {
    return undefined
  }
  return {
    name,
    owner: parts[0],
  }
}

export const parseGitHubRemoteUrl = (value: string): GitHubRepository | undefined => {
  const remoteUrl = value.trim()
  const scpMatch = remoteUrl.match(scpRemoteRegex)
  if (scpMatch && isGitHubHostname(scpMatch[1])) {
    return fromPath(scpMatch[2])
  }
  let url: URL
  try {
    url = new URL(remoteUrl)
  } catch {
    return undefined
  }
  if (!isGitHubHostname(url.hostname)) {
    return undefined
  }
  return fromPath(url.pathname)
}
