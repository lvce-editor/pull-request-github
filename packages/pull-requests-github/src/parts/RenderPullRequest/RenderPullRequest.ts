import type { PullRequestData } from '@lvce-editor/pull-request-shared'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'

const metaRowNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestOverviewMetaRow',
  type: VirtualDomElements.Div,
}

const metaLabelNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestOverviewMetaLabel',
  type: VirtualDomElements.Span,
}

const detailsPanelNode: VirtualDomNode = {
  childCount: 4,
  className: 'PullRequestOverviewSideCard',
  type: VirtualDomElements.Div,
}

const sideHeadingNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestOverviewSideHeading',
  type: VirtualDomElements.H3,
}

const labelsPanelNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestOverviewSideCard',
  type: VirtualDomElements.Div,
}

const conversationPanelNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestOverviewSideCard',
  type: VirtualDomElements.Div,
}

const conversationNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestOverviewConversation',
  type: VirtualDomElements.Div,
}

const commentIconNode: VirtualDomNode = {
  childCount: 0,
  className: 'PullRequestCommentIcon',
  type: VirtualDomElements.Span,
}

const overviewNode: VirtualDomNode = {
  ariaLabel: 'Overview',
  childCount: 2,
  className: 'PullRequestOverview',
  role: AriaRoles.Panel,
  type: VirtualDomElements.Div,
}

const overviewMainNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestOverviewMain',
  type: VirtualDomElements.Div,
}

const overviewCardNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestOverviewCard',
  type: VirtualDomElements.Article,
}

const overviewCardHeaderNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestOverviewCardHeader',
  type: VirtualDomElements.Header,
}

const overviewDescriptionNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestOverviewDescription',
  type: VirtualDomElements.Div,
}

const formatUpdatedAt = (updatedAt: string | undefined): string => {
  if (!updatedAt) {
    return ''
  }
  const timestamp = Date.parse(updatedAt)
  if (!Number.isFinite(timestamp)) {
    return ''
  }
  const hours = Math.round((Date.now() - timestamp) / (60 * 60 * 1000))
  if (hours < 1) {
    return 'just now'
  }
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

const getLabelTone = (name: string): string => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('review') || lowerName.includes('waiting') || lowerName.includes('blocked')) {
    return 'PullRequestLabelWarn'
  }
  if (lowerName.includes('bug') || lowerName.includes('breaking')) {
    return 'PullRequestLabelDanger'
  }
  if (lowerName.includes('docs') || lowerName.includes('documentation')) {
    return 'PullRequestLabelPurple'
  }
  return 'PullRequestLabelInfo'
}

const renderMetaRow = (label: string, value: string, valueClass = ''): readonly VirtualDomNode[] => {
  return [
    metaRowNode,
    metaLabelNode,
    text(label),
    {
      childCount: 1,
      className: mergeClassNames('PullRequestOverviewMetaValue', valueClass),
      type: VirtualDomElements.Span,
    },
    text(value),
  ]
}

const renderDetailsPanel = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
  return [
    detailsPanelNode,
    sideHeadingNode,
    text('Details'),
    ...renderMetaRow('Author', pullRequest.author || 'Unknown'),
    ...renderMetaRow('Head', pullRequest.headBranch || 'head', 'PullRequestOverviewBranch'),
    ...renderMetaRow('Base', pullRequest.baseBranch || 'base', 'PullRequestOverviewBranch'),
  ]
}

const renderLabelsPanel = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
  const labels = pullRequest.labels ?? []
  if (labels.length === 0) {
    return []
  }
  return [
    labelsPanelNode,
    sideHeadingNode,
    text('Labels'),
    {
      childCount: labels.length,
      className: 'PullRequestOverviewLabels',
      type: VirtualDomElements.Div,
    },
    ...labels.flatMap((label) => [
      {
        childCount: 1,
        className: mergeClassNames('PullRequestLabel', getLabelTone(label.name)),
        title: label.color ? `${label.name} (#${label.color})` : label.name,
        type: VirtualDomElements.Span,
      },
      text(label.name),
    ]),
  ]
}

const renderConversationPanel = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
  const comments = pullRequest.comments ?? 0
  return [
    conversationPanelNode,
    sideHeadingNode,
    text('Conversation'),
    conversationNode,
    commentIconNode,
    text(`${comments} ${comments === 1 ? 'comment' : 'comments'}`),
  ]
}

export const renderPullRequest = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
  const updatedAt = formatUpdatedAt(pullRequest.updatedAt)
  const updatedAtLabel = updatedAt ? ` ${updatedAt}` : ''
  const openedBy = `${pullRequest.author || 'A contributor'} opened this pull request${updatedAtLabel}`
  const labels = pullRequest.labels ?? []
  return [
    overviewNode,
    overviewMainNode,
    overviewCardNode,
    overviewCardHeaderNode,
    text(openedBy),
    overviewDescriptionNode,
    text(pullRequest.description || 'No description'),
    {
      childCount: 2 + (labels.length > 0 ? 1 : 0),
      className: 'PullRequestOverviewSidebar',
      type: VirtualDomElements.Div,
    },
    ...renderDetailsPanel(pullRequest),
    ...renderLabelsPanel(pullRequest),
    ...renderConversationPanel(pullRequest),
  ]
}
