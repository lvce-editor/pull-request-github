import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { Open, pullRequestPageSize } from '@lvce-editor/pull-request-shared'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const ellipsisNode: VirtualDomNode = { childCount: 1, type: VirtualDomElements.Span }

export const renderPullRequestPagination = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { actionPending, closedCount, filter, openCount, page, status } = state
  const total = filter === Open ? openCount : closedCount
  const pages = Math.ceil((total || 0) / pullRequestPageSize)
  if (pages < 2) return []
  const pageNumbers = [...new Set([1, page - 1, page, page + 1, pages])].filter((number) => number >= 1 && number <= pages).toSorted((a, b) => a - b)
  const nodes: VirtualDomNode[] = []
  const button = (target: number, label: string): void => {
    nodes.push(
      {
        ariaCurrent: target === page ? 'page' : undefined,
        ariaLabel: label === String(target) ? `Page ${label}` : label,
        childCount: 1,
        disabled: actionPending || status !== 'ready' || target < 1 || target > pages || target === page,
        name: `pullRequestPage:${target}`,
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text(label),
    )
  }
  button(page - 1, 'Previous')
  let previous = 0
  for (const number of pageNumbers) {
    if (previous && number - previous > 1) nodes.push(ellipsisNode, text('…'))
    button(number, String(number))
    previous = number
  }
  button(page + 1, 'Next')
  return [
    { ariaLabel: 'Pull request pages', childCount: nodes.length / 2, className: 'PullRequestPagination', type: VirtualDomElements.Nav },
    ...nodes,
  ]
}
