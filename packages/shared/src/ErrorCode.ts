export const GitHubInvalidCommitData = 'E_GITHUB_INVALID_COMMIT_DATA'
export const GitHubInvalidFileData = 'E_GITHUB_INVALID_FILE_DATA'
export const GitHubInvalidListData = 'E_GITHUB_INVALID_LIST_DATA'
export const GitHubInvalidPullRequestUrl = 'E_GITHUB_INVALID_PULL_REQUEST_URL'
export const GitHubRemoteRequired = 'E_GITHUB_REMOTE_REQUIRED'
export const GitHubRequestFailed = 'E_GITHUB_REQUEST_FAILED'
export const GitRemoteNotFound = 'E_GIT_REMOTE_NOT_FOUND'
export const GitRepositoryNotFound = 'E_GIT_REPOSITORY_NOT_FOUND'
export const Unknown = 'E_UNKNOWN'

export type ErrorCode =
  | typeof GitHubInvalidCommitData
  | typeof GitHubInvalidFileData
  | typeof GitHubInvalidListData
  | typeof GitHubInvalidPullRequestUrl
  | typeof GitHubRemoteRequired
  | typeof GitHubRequestFailed
  | typeof GitRemoteNotFound
  | typeof GitRepositoryNotFound
  | typeof Unknown
