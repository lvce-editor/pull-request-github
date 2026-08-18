import * as GitHubPullRequest from '../GitHubPullRequest/GitHubPullRequest.ts'
import * as GitHubPullRequestList from '../GitHubPullRequestList/GitHubPullRequestList.ts'
import * as PullRequestMockRegistry from '../PullRequestMockRegistry/PullRequestMockRegistry.ts'
import * as PullRequestUrl from '../PullRequestUrl/PullRequestUrl.ts'

export const commandMap = {
  'GitHub.clearPullRequestData': PullRequestMockRegistry.clearPullRequestData,
  'GitHub.fetchPullRequest': GitHubPullRequest.fetchPullRequest,
  'GitHub.fetchPullRequests': GitHubPullRequestList.fetchPullRequests,
  'GitHub.setPullRequestData': PullRequestMockRegistry.setPullRequestData,
  'GitHub.setPullRequestError': PullRequestMockRegistry.setPullRequestError,
  'GitHub.setPullRequestListData': PullRequestMockRegistry.setPullRequestListData,
  'GitHub.setPullRequestListError': PullRequestMockRegistry.setPullRequestListError,
  'GitHub.setPullRequestListResponse': PullRequestMockRegistry.setPullRequestListResponse,
  'GitHub.setPullRequestResponse': PullRequestMockRegistry.setPullRequestResponse,
  'GitHub.validatePullRequestUrl': PullRequestUrl.validatePullRequestUrl,
}
