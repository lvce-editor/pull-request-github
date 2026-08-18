import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { Closed, Open, type PullRequestFilter } from '@lvce-editor/pull-request-shared'
import { AriaRoles, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { renderPullRequestTab } from '../RenderPullRequestTab/RenderPullRequestTab.ts'

const tabListNode: VirtualDomNode = {
  ariaLabel: 'Pull request state',
  childCount: 2,
  className: 'PullRequestTabs',
  role: AriaRoles.TabList,
  type: VirtualDomElements.Div,
}

export const renderPullRequestTabs = (activeFilter: PullRequestFilter, openCount: number, closedCount: number): readonly VirtualDomNode[] => {
  return [tabListNode, ...renderPullRequestTab(Open, activeFilter, openCount), ...renderPullRequestTab(Closed, activeFilter, closedCount)]
}
