import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as PullRequestFilters from '../PullRequestFilter/PullRequestFilter.ts'
import * as PullRequestViewStatus from '../PullRequestViewState/PullRequestViewState.ts'
import { renderPullRequestList } from '../RenderPullRequestList/RenderPullRequestList.ts'

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
  const { error, filter, pullRequests, status } = state
  if (status === PullRequestViewStatus.Loading) {
    return renderMessage('Loading pull requests...')
  }
  if (status === PullRequestViewStatus.Error) {
    return renderMessage(error, true)
  }
  if (status === PullRequestViewStatus.Unavailable) {
    return renderMessage(error)
  }
  if (status === PullRequestViewStatus.Ready && pullRequests.length > 0) {
    return renderPullRequestList(pullRequests)
  }
  const stateLabel = filter === PullRequestFilters.Open ? 'open' : 'closed'
  return renderMessage(`No ${stateLabel} pull requests.`)
}
