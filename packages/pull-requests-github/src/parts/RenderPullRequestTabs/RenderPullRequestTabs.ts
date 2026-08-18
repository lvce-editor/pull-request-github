import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import * as PullRequestFilters from '../PullRequestFilter/PullRequestFilter.ts'
import { renderPullRequestTab } from '../RenderPullRequestTab/RenderPullRequestTab.ts'

const tabListNode: VirtualDomNode = {
  ariaLabel: 'Pull request state',
  childCount: 2,
  className: 'PullRequestTabs',
  role: AriaRoles.TabList,
  type: VirtualDomElements.Div,
}

export const renderPullRequestTabs = (activeFilter: PullRequestFilter, openCount: number, closedCount: number): readonly VirtualDomNode[] => {
  return [
    tabListNode,
    ...renderPullRequestTab(PullRequestFilters.Open, activeFilter, openCount),
    ...renderPullRequestTab(PullRequestFilters.Closed, activeFilter, closedCount),
  ]
}
