import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as PullRequestFilters from '../PullRequestFilter/PullRequestFilter.ts'

const tabListNode: VirtualDomNode = {
  ariaLabel: 'Pull request state',
  childCount: 2,
  className: 'PullRequestTabs',
  role: AriaRoles.TabList,
  type: VirtualDomElements.Div,
}

const renderTab = (filter: PullRequestFilter, activeFilter: PullRequestFilter, count: number): readonly VirtualDomNode[] => {
  const active = filter === activeFilter
  const label = filter === PullRequestFilters.Open ? 'Open' : 'Closed'
  const name = filter === PullRequestFilters.Open ? 'showOpenPullRequests' : 'showClosedPullRequests'
  return [
    {
      ariaSelected: active,
      childCount: 2,
      className: mergeClassNames('PullRequestTab', active ? 'PullRequestTabActive' : ''),
      name,
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.Tab,
      tabIndex: active ? 0 : -1,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 1,
      name,
      type: VirtualDomElements.Span,
    },
    text(label),
    {
      childCount: 1,
      className: 'PullRequestTabCount',
      name,
      type: VirtualDomElements.Span,
    },
    text(String(count)),
  ]
}

export const renderPullRequestTabs = (activeFilter: PullRequestFilter, openCount: number, closedCount: number): readonly VirtualDomNode[] => {
  return [
    tabListNode,
    ...renderTab(PullRequestFilters.Open, activeFilter, openCount),
    ...renderTab(PullRequestFilters.Closed, activeFilter, closedCount),
  ]
}
