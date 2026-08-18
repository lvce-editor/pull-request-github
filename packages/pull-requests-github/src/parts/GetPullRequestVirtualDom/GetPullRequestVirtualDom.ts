import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
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
  childCount: 3,
  className: mergeClassNames('Viewlet', 'PullRequestView'),
  type: VirtualDomElements.Div,
}

const detailViewNode: VirtualDomNode = {
  childCount: 3,
  className: mergeClassNames('Viewlet', 'PullRequestView', 'PullRequestDetailView'),
  type: VirtualDomElements.Div,
}

const renderDetailContent = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { detailTab, pullRequest } = state
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
  const { filter, repository } = state
  const repositoryLabel = repository ? `${repository.owner}/${repository.name}` : 'Pull requests'
  const description = repository ? 'Pull requests for the current GitHub repository.' : 'Reading the Git remote for the current workspace.'
  return [
    listViewNode,
    introNode,
    titleNode,
    text(repositoryLabel),
    descriptionNode,
    text(description),
    ...renderPullRequestTabs(filter),
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
