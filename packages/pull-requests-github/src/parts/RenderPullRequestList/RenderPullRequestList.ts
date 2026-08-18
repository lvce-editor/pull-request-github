import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { Closed, type PullRequestFilter, type PullRequestLabel, type PullRequestListItem } from '@lvce-editor/pull-request-shared'
import { mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const listItemNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestListItem',
  type: VirtualDomElements.Li,
}

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const formatUpdatedAt = (updatedAt: string): string => {
  const timestamp = Date.parse(updatedAt)
  if (!Number.isFinite(timestamp)) {
    return ''
  }
  const seconds = Math.round((timestamp - Date.now()) / 1000)
  const absoluteSeconds = Math.abs(seconds)
  if (absoluteSeconds < 60) {
    return 'just now'
  }
  if (absoluteSeconds < 60 * 60) {
    return relativeTime.format(Math.round(seconds / 60), 'minute')
  }
  if (absoluteSeconds < 60 * 60 * 24) {
    return relativeTime.format(Math.round(seconds / (60 * 60)), 'hour')
  }
  if (absoluteSeconds < 60 * 60 * 24 * 30) {
    return relativeTime.format(Math.round(seconds / (60 * 60 * 24)), 'day')
  }
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(timestamp)
}

const getLabelTone = (label: PullRequestLabel): string => {
  const name = label.name.toLowerCase()
  if (name.includes('review') || name.includes('waiting') || name.includes('blocked')) {
    return 'PullRequestLabelWarn'
  }
  if (name.includes('bug') || name.includes('breaking')) {
    return 'PullRequestLabelDanger'
  }
  if (name.includes('docs') || name.includes('documentation')) {
    return 'PullRequestLabelPurple'
  }
  return 'PullRequestLabelInfo'
}

const renderLabel = (label: PullRequestLabel, name: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: mergeClassNames('PullRequestLabel', getLabelTone(label)),
      name,
      title: label.color ? `${label.name} (#${label.color})` : label.name,
      type: VirtualDomElements.Span,
    },
    text(label.name),
  ]
}

const getTitle = (pullRequest: PullRequestListItem): string => {
  const title = pullRequest.title || `Pull request #${pullRequest.number}`
  return pullRequest.draft && !title.toLowerCase().startsWith('draft:') ? `Draft: ${title}` : title
}

const getMetadata = (pullRequest: PullRequestListItem): string => {
  const parts = [`#${pullRequest.number}`]
  if (pullRequest.author) {
    parts.push(`by ${pullRequest.author}`)
  }
  if (pullRequest.headBranch || pullRequest.baseBranch) {
    parts.push(`${pullRequest.headBranch || 'head'} → ${pullRequest.baseBranch || 'base'}`)
  }
  const updatedAt = formatUpdatedAt(pullRequest.updatedAt)
  if (updatedAt) {
    parts.push(`updated ${updatedAt}`)
  }
  return parts.join(' · ')
}

const getStateClass = (pullRequest: PullRequestListItem, filter: PullRequestFilter): string => {
  if (pullRequest.draft) {
    return 'PullRequestStateDraft'
  }
  if (filter === Closed) {
    return 'PullRequestStateClosed'
  }
  return 'PullRequestStateOpen'
}

const renderComments = (pullRequest: PullRequestListItem, name: string): readonly VirtualDomNode[] => {
  if (!pullRequest.comments) {
    return []
  }
  return [
    {
      ariaLabel: `${pullRequest.comments} comments`,
      childCount: 2,
      className: 'PullRequestListItemComments',
      name,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      className: 'PullRequestCommentIcon',
      name,
      type: VirtualDomElements.Span,
    },
    text(String(pullRequest.comments)),
  ]
}

const renderPullRequestListItem = (pullRequest: PullRequestListItem, filter: PullRequestFilter): readonly VirtualDomNode[] => {
  const name = `openPullRequest:${pullRequest.number}`
  const labels = pullRequest.labels ?? []
  const title = getTitle(pullRequest)
  const stateClass = getStateClass(pullRequest, filter)
  return [
    listItemNode,
    {
      ariaLabel: `Pull request ${pullRequest.number}: ${title}`,
      childCount: pullRequest.comments ? 3 : 2,
      className: 'PullRequestListItemButton',
      name,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: mergeClassNames('PullRequestStateIcon', stateClass),
      name,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 2,
      className: 'PullRequestListItemContent',
      name,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1 + labels.length,
      className: 'PullRequestListItemHeading',
      name,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'PullRequestListItemTitle',
      name,
      type: VirtualDomElements.Span,
    },
    text(title),
    ...labels.flatMap((label) => renderLabel(label, name)),
    {
      childCount: 1,
      className: 'PullRequestListItemMetadata',
      name,
      type: VirtualDomElements.Span,
    },
    text(getMetadata(pullRequest)),
    ...renderComments(pullRequest, name),
  ]
}

export const renderPullRequestList = (pullRequests: readonly PullRequestListItem[], filter: PullRequestFilter): readonly VirtualDomNode[] => {
  return [
    {
      childCount: pullRequests.length,
      className: 'PullRequestList',
      type: VirtualDomElements.Ul,
    },
    ...pullRequests.flatMap((pullRequest) => renderPullRequestListItem(pullRequest, filter)),
  ]
}
