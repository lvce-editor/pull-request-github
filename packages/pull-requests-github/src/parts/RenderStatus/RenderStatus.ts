import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as PullRequestViewStatus from '../PullRequestViewState/PullRequestViewState.ts'
import { renderPullRequest } from '../RenderPullRequest/RenderPullRequest.ts'

const messageNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestMessage',
  role: AriaRoles.Status,
  type: VirtualDomElements.Div,
}

const errorMessageNode: VirtualDomNode = {
  childCount: 1,
  className: mergeClassNames('PullRequestMessage', 'PullRequestMessageError'),
  role: AriaRoles.Alert,
  type: VirtualDomElements.Div,
}

export const renderStatus = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { error, pullRequest, status } = state
  if (status === PullRequestViewStatus.Loading) {
    return [messageNode, text('Loading pull request...')]
  }
  if (status === PullRequestViewStatus.Error) {
    return [errorMessageNode, text(error)]
  }
  if (status === PullRequestViewStatus.Ready && pullRequest) {
    return renderPullRequest(pullRequest)
  }
  return [messageNode, text('Enter a GitHub pull request URL.')]
}
