import type { PullRequestData } from '@lvce-editor/pull-request-shared'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestDetailTab } from '../PullRequestDetailTab/PullRequestDetailTab.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as PullRequestDetailTabs from '../PullRequestDetailTab/PullRequestDetailTab.ts'

const tabListNode: VirtualDomNode = {
  ariaLabel: 'Pull request details',
  childCount: 3,
  className: mergeClassNames('PullRequestTabs', 'PullRequestDetailTabs'),
  role: AriaRoles.TabList,
  type: VirtualDomElements.Div,
}

interface TabData {
  readonly label: string
  readonly name: string
  readonly tab: PullRequestDetailTab
}

const renderTab = (tabData: TabData, activeTab: PullRequestDetailTab): readonly VirtualDomNode[] => {
  const active = tabData.tab === activeTab
  const className = active ? mergeClassNames('PullRequestTab', 'PullRequestTabActive') : 'PullRequestTab'
  return [
    {
      ariaSelected: active,
      childCount: 1,
      className,
      name: tabData.name,
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.Tab,
      tabIndex: active ? 0 : -1,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 1,
      name: tabData.name,
      type: VirtualDomElements.Span,
    },
    text(tabData.label),
  ]
}

export const renderPullRequestDetailTabs = (pullRequest: PullRequestData, activeTab: PullRequestDetailTab): readonly VirtualDomNode[] => {
  const tabs: readonly TabData[] = [
    {
      label: 'Overview',
      name: 'showPullRequestOverview',
      tab: PullRequestDetailTabs.Overview,
    },
    {
      label: `Commits ${pullRequest.commits.length}`,
      name: 'showPullRequestCommits',
      tab: PullRequestDetailTabs.Commits,
    },
    {
      label: `Changes ${pullRequest.files.length}`,
      name: 'showPullRequestChanges',
      tab: PullRequestDetailTabs.Changes,
    },
  ]
  return [tabListNode, ...tabs.flatMap((tab) => renderTab(tab, activeTab))]
}
