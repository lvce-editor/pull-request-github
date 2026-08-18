import { ErrorCodes, PullRequestError } from '@lvce-editor/pull-request-shared'

export interface PullRequestLocation {
  readonly number: number
  readonly owner: string
  readonly repo: string
}

export const parsePullRequestUrl = (value: string): PullRequestLocation => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new PullRequestError('Enter a valid GitHub pull request URL', ErrorCodes.GitHubInvalidPullRequestUrl)
  }
  if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
    throw new PullRequestError('Only https://github.com pull request URLs are supported', ErrorCodes.GitHubInvalidPullRequestUrl)
  }
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 4 || parts[2] !== 'pull') {
    throw new PullRequestError('Enter a GitHub pull request URL like https://github.com/owner/repo/pull/123', ErrorCodes.GitHubInvalidPullRequestUrl)
  }
  const number = Number(parts[3])
  if (!Number.isSafeInteger(number) || number <= 0 || String(number) !== parts[3]) {
    throw new PullRequestError('Pull request number must be a positive integer', ErrorCodes.GitHubInvalidPullRequestUrl)
  }
  return {
    number,
    owner: parts[0],
    repo: parts[1],
  }
}

export const validatePullRequestUrl = (value: string): void => {
  parsePullRequestUrl(value)
}
