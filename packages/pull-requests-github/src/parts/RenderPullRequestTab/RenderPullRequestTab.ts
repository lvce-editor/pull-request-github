import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { Open, type PullRequestFilter } from '@lvce-editor/pull-request-shared'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

export const renderPullRequestTab = (filter: PullRequestFilter, activeFilter: PullRequestFilter, count: number): readonly VirtualDomNode[] => {
  const active = filter === activeFilter
  const label = filter === Open ? 'Open' : 'Closed'
  const name = filter === Open ? 'showOpenPullRequests' : 'showClosedPullRequests'
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
