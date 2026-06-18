import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as PullRequestViewStatus from '../PullRequestViewState/PullRequestViewState.ts'
import { renderPullRequest } from '../RenderPullRequest/RenderPullRequest.ts'

export const renderStatus = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  if (state.status === PullRequestViewStatus.Loading) {
    return [
      {
        childCount: 1,
        className: 'PullRequestMessage',
        type: VirtualDomElements.Div,
      },
      text('Loading pull request...'),
    ]
  }
  if (state.status === PullRequestViewStatus.Error) {
    return [
      {
        childCount: 1,
        className: 'PullRequestMessage PullRequestMessageError',
        type: VirtualDomElements.Div,
      },
      text(state.error),
    ]
  }
  if (state.status === PullRequestViewStatus.Ready && state.pullRequest) {
    return renderPullRequest(state.pullRequest)
  }
  return [
    {
      childCount: 1,
      className: 'PullRequestMessage',
      type: VirtualDomElements.Div,
    },
    text('Enter a GitHub pull request URL.'),
  ]
}
