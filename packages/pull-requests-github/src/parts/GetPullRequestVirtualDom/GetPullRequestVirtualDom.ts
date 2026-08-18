import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as PullRequestDetailTabs from '../PullRequestDetailTab/PullRequestDetailTab.ts'
import * as PullRequestViewStates from '../PullRequestViewState/PullRequestViewState.ts'
import { renderPullRequest } from '../RenderPullRequest/RenderPullRequest.ts'
import { renderPullRequestChanges } from '../RenderPullRequestChanges/RenderPullRequestChanges.ts'
import { renderPullRequestCommits } from '../RenderPullRequestCommits/RenderPullRequestCommits.ts'
import { renderPullRequestDetailTabs } from '../RenderPullRequestDetailTabs/RenderPullRequestDetailTabs.ts'
import { renderPullRequestListStatus } from '../RenderPullRequestListStatus/RenderPullRequestListStatus.ts'
import { renderPullRequestTabs } from '../RenderPullRequestTabs/RenderPullRequestTabs.ts'

const listViewNode: VirtualDomNode = {
  childCount: 2,
  className: mergeClassNames('Viewlet', 'PullRequestView'),
  type: VirtualDomElements.Div,
}

const detailViewNode: VirtualDomNode = {
  childCount: 3,
  className: mergeClassNames('Viewlet', 'PullRequestView', 'PullRequestDetailView'),
  type: VirtualDomElements.Div,
}

const renderDetailMessage = (message: string, error = false): readonly VirtualDomNode[] => {
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

const renderDetailContent = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { detailTab, error, pullRequest, status } = state
  if (status === PullRequestViewStates.Loading) {
    return renderDetailMessage('Loading pull request...')
  }
  if (status === PullRequestViewStates.Error) {
    return renderDetailMessage(error, true)
  }
  if (!pullRequest) {
    return []
  }
  if (detailTab === PullRequestDetailTabs.Commits) {
    return renderPullRequestCommits(pullRequest.commits)
  }
  if (detailTab === PullRequestDetailTabs.Changes) {
    return renderPullRequestChanges(pullRequest.files)
  }
  return renderPullRequest(pullRequest)
}

const introNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestIntro',
  type: VirtualDomElements.Div,
}

const listHeaderNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestListHeader',
  type: VirtualDomElements.Header,
}

const listActionsNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestListActions',
  type: VirtualDomElements.Div,
}

const searchNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestSearch',
  type: VirtualDomElements.Div,
}

const searchIconNode: VirtualDomNode = {
  childCount: 0,
  className: mergeClassNames('MaskIcon', 'MaskIconSearch', 'PullRequestSearchIcon'),
  type: VirtualDomElements.Span,
}

const refreshButtonNode: VirtualDomNode = {
  ariaLabel: 'Refresh pull requests',
  childCount: 1,
  className: 'PullRequestRefreshButton',
  name: 'refreshPullRequests',
  onClick: DomEventListenerFunctions.HandleClick,
  title: 'Refresh pull requests',
  type: VirtualDomElements.Button,
}

const refreshIconNode: VirtualDomNode = {
  childCount: 0,
  className: mergeClassNames('MaskIcon', 'MaskIconRefresh', 'PullRequestRefreshIcon'),
  name: 'refreshPullRequests',
  type: VirtualDomElements.Span,
}

const listCardNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestListCard',
  type: VirtualDomElements.Div,
}

const titleNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestTitle',
  type: VirtualDomElements.H2,
}

const descriptionNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestDescription',
  type: VirtualDomElements.P,
}

const detailHeaderNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestDetailHeader',
  type: VirtualDomElements.Div,
}

const backButtonNode: VirtualDomNode = {
  ariaLabel: 'Back to pull requests',
  childCount: 1,
  className: 'PullRequestBackButton',
  name: 'showPullRequestList',
  onClick: DomEventListenerFunctions.HandleClick,
  type: VirtualDomElements.Button,
}

const backButtonLabelNode: VirtualDomNode = {
  childCount: 1,
  name: 'showPullRequestList',
  type: VirtualDomElements.Span,
}

const renderListView = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { closedPullRequests, filter, openPullRequests, query, repository } = state
  const repositoryLabel = repository ? `${repository.owner} / ${repository.name}` : 'Reading the current workspace repository…'
  return [
    listViewNode,
    listHeaderNode,
    introNode,
    titleNode,
    text('Pull Requests'),
    descriptionNode,
    text(repositoryLabel),
    listActionsNode,
    searchNode,
    searchIconNode,
    {
      ariaLabel: 'Filter pull requests',
      childCount: 0,
      className: 'PullRequestSearchInput',
      name: 'filterPullRequests',
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: 'Filter pull requests',
      type: VirtualDomElements.Input,
      value: query,
    },
    refreshButtonNode,
    refreshIconNode,
    listCardNode,
    ...renderPullRequestTabs(filter, openPullRequests.length, closedPullRequests.length),
    ...renderPullRequestListStatus(state),
  ]
}

const renderDetailView = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { detailTab, pullRequest, repository } = state
  if (!pullRequest) {
    return renderListView(state)
  }
  const repositoryLabel = repository ? `${repository.owner}/${repository.name}` : 'Pull request'
  return [
    detailViewNode,
    detailHeaderNode,
    backButtonNode,
    backButtonLabelNode,
    text('‹'),
    introNode,
    titleNode,
    text('Pull request details'),
    descriptionNode,
    text(repositoryLabel),
    ...renderPullRequestDetailTabs(pullRequest, detailTab),
    ...renderDetailContent(state),
  ]
}

export const getPullRequestVirtualDom = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { screen } = state
  return screen === PullRequestViewStates.Detail ? renderDetailView(state) : renderListView(state)
}
