import * as GitHubPullRequest from '../GitHubPullRequest/GitHubPullRequest.ts'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'
import * as PullRequestUrl from '../PullRequestUrl/PullRequestUrl.ts'

export const commandMap = {
  'GitHub.clearPullRequestData': PullRequestMockRegistry.clearPullRequestData,
  'GitHub.fetchPullRequest': GitHubPullRequest.fetchPullRequest,
  'GitHub.setPullRequestData': PullRequestMockRegistry.setPullRequestData,
  'GitHub.setPullRequestError': PullRequestMockRegistry.setPullRequestError,
  'GitHub.validatePullRequestUrl': PullRequestUrl.validatePullRequestUrl,
}
