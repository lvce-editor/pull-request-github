import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestListItem } from '../PullRequestListItem/PullRequestListItem.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const listItemNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestListItem',
  type: VirtualDomElements.Li,
}

const renderPullRequestListItem = (pullRequest: PullRequestListItem): readonly VirtualDomNode[] => {
  const name = `openPullRequest:${pullRequest.number}`
  return [
    listItemNode,
    {
      ariaLabel: `Pull request ${pullRequest.number}: ${pullRequest.title}`,
      childCount: 3,
      className: 'PullRequestListItemButton',
      name,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 1,
      className: 'PullRequestListItemTitle',
      name,
      type: VirtualDomElements.Span,
    },
    text(pullRequest.title || `Pull request #${pullRequest.number}`),
    {
      childCount: 1,
      className: 'PullRequestListItemNumber',
      name,
      type: VirtualDomElements.Span,
    },
    text(`#${pullRequest.number}`),
    {
      childCount: 1,
      className: 'PullRequestListItemBranches',
      name,
      type: VirtualDomElements.Span,
    },
    text(`${pullRequest.headBranch} → ${pullRequest.baseBranch}`),
  ]
}

export const renderPullRequestList = (pullRequests: readonly PullRequestListItem[]): readonly VirtualDomNode[] => {
  return [
    {
      childCount: pullRequests.length,
      className: 'PullRequestList',
      type: VirtualDomElements.Ul,
    },
    ...pullRequests.flatMap(renderPullRequestListItem),
  ]
}
