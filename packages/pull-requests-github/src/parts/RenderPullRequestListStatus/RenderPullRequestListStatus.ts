import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as PullRequestFilters from '../PullRequestFilter/PullRequestFilter.ts'
import * as PullRequestViewStatus from '../PullRequestViewState/PullRequestViewState.ts'
import { renderPullRequestList } from '../RenderPullRequestList/RenderPullRequestList.ts'

const matchesQuery = (pullRequest: PullRequestViewState['pullRequests'][number], query: string): boolean => {
  const searchableText = [
    pullRequest.title,
    pullRequest.author,
    pullRequest.headBranch,
    pullRequest.baseBranch,
    String(pullRequest.number),
    ...(pullRequest.labels ?? []).map((label) => label.name),
  ]
    .join(' ')
    .toLowerCase()
  return searchableText.includes(query)
}

const renderMessage = (message: string, error = false): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: mergeClassNames('PullRequestMessage', error ? 'PullRequestMessageError' : ''),
      role: error ? AriaRoles.Alert : AriaRoles.Status,
      type: VirtualDomElements.Div,
    },
    text(message),
  ]
}

export const renderPullRequestListStatus = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { error, filter, pullRequests, query, status } = state
  if (status === PullRequestViewStatus.Loading) {
    return renderMessage('Loading pull requests...')
  }
  if (status === PullRequestViewStatus.Error) {
    return renderMessage(error, true)
  }
  if (status === PullRequestViewStatus.Unavailable) {
    return renderMessage(error)
  }
  const normalizedQuery = query.trim().toLowerCase()
  const filteredPullRequests = normalizedQuery ? pullRequests.filter((pullRequest) => matchesQuery(pullRequest, normalizedQuery)) : pullRequests
  if (status === PullRequestViewStatus.Ready && filteredPullRequests.length > 0) {
    return renderPullRequestList(filteredPullRequests, filter)
  }
  if (status === PullRequestViewStatus.Ready && normalizedQuery && pullRequests.length > 0) {
    return renderMessage(`No pull requests match “${query.trim()}”.`)
  }
  const stateLabel = filter === PullRequestFilters.Open ? 'open' : 'closed'
  return renderMessage(`No ${stateLabel} pull requests.`)
}
