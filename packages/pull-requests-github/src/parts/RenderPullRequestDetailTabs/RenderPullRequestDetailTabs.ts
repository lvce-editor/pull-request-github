import type { PullRequestData } from '@lvce-editor/pull-request-shared'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestDetailTab } from '../PullRequestDetailTab/PullRequestDetailTab.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as PullRequestDetailTabs from '../PullRequestDetailTab/PullRequestDetailTab.ts'

const tabListNode: VirtualDomNode = {
  ariaLabel: 'Pull request details',
  childCount: 4,
  className: mergeClassNames('PullRequestTabs', 'PullRequestDetailTabs'),
  role: AriaRoles.TabList,
  type: VirtualDomElements.Div,
}

const diffStatsNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestDiffStats',
  type: VirtualDomElements.Span,
}

const additionsNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestDiffStatAdditions',
  type: VirtualDomElements.Span,
}

const deletionsNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestDiffStatDeletions',
  type: VirtualDomElements.Span,
}

interface TabData {
  readonly count: number | undefined
  readonly icon: string
  readonly label: string
  readonly name: string
  readonly tab: PullRequestDetailTab
}

const renderCount = (tabData: TabData): readonly VirtualDomNode[] => {
  if (tabData.count === undefined) {
    return []
  }
  return [
    {
      childCount: 1,
      className: 'PullRequestDetailTabCount',
      name: tabData.name,
      type: VirtualDomElements.Span,
    },
    text(` ${tabData.count}`),
  ]
}

const renderTab = (tabData: TabData, activeTab: PullRequestDetailTab): readonly VirtualDomNode[] => {
  const active = tabData.tab === activeTab
  const className = active ? mergeClassNames('PullRequestTab', 'PullRequestTabActive') : 'PullRequestTab'
  return [
    {
      ariaSelected: active,
      childCount: tabData.count === undefined ? 2 : 3,
      className,
      name: tabData.name,
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.Tab,
      tabIndex: active ? 0 : -1,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: mergeClassNames('PullRequestDetailTabIcon', tabData.icon),
      name: tabData.name,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 1,
      name: tabData.name,
      type: VirtualDomElements.Span,
    },
    text(tabData.label),
    ...renderCount(tabData),
  ]
}

export const renderPullRequestDetailTabs = (pullRequest: PullRequestData, activeTab: PullRequestDetailTab): readonly VirtualDomNode[] => {
  const tabs: readonly TabData[] = [
    {
      count: undefined,
      icon: 'PullRequestOverviewIcon',
      label: 'Overview',
      name: 'showPullRequestOverview',
      tab: PullRequestDetailTabs.Overview,
    },
    {
      count: pullRequest.commits.length,
      icon: 'PullRequestCommitsIcon',
      label: 'Commits',
      name: 'showPullRequestCommits',
      tab: PullRequestDetailTabs.Commits,
    },
    {
      count: pullRequest.files.length,
      icon: 'PullRequestChangesIcon',
      label: 'Changes',
      name: 'showPullRequestChanges',
      tab: PullRequestDetailTabs.Changes,
    },
  ]
  const additions = pullRequest.files.reduce((total, file) => total + file.additions, 0)
  const deletions = pullRequest.files.reduce((total, file) => total + file.deletions, 0)
  return [
    tabListNode,
    ...tabs.flatMap((tab) => renderTab(tab, activeTab)),
    diffStatsNode,
    additionsNode,
    text(`+${additions}`),
    deletionsNode,
    text(`−${deletions}`),
  ]
}
