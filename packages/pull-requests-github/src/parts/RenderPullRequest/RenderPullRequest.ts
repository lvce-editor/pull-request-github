import type { PullRequestData } from '@lvce-editor/pull-request-shared'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

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

const checksPanelNode: VirtualDomNode = {
  childCount: 2,
  className: mergeClassNames('PullRequestOverviewSideCard', 'PullRequestChecksPanel'),
  type: VirtualDomElements.Div,
}

const checkSummaryNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestChecksSummary',
  type: VirtualDomElements.Div,
}

const checkOutcomeNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestCheckOutcome',
  type: VirtualDomElements.Span,
}

const checkNameNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestCheckName',
  type: VirtualDomElements.Span,
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
  childCount: 2,
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

const getCheckOutcome = (check: NonNullable<PullRequestData['checks']>[number]): string => {
  if (check.status !== 'completed') return 'pending'
  switch (check.conclusion) {
    case 'action_required':
    case 'failure':
    case 'timed_out':
      return 'failed'
    case 'cancelled':
      return 'cancelled'
    case 'skipped':
      return 'skipped'
    case 'success':
      return 'passed'
    default:
      return 'unknown'
  }
}

const renderChecksPanel = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
  if (pullRequest.checksStatus === 'unavailable') {
    return [checksPanelNode, sideHeadingNode, text('Checks'), checkSummaryNode, text('Check status is unavailable')]
  }
  const checks = pullRequest.checks ?? []
  if (checks.length === 0) {
    return [checksPanelNode, sideHeadingNode, text('Checks'), checkSummaryNode, text('No checks reported')]
  }
  const outcomes = checks.map(getCheckOutcome)
  const passed = outcomes.filter((outcome) => outcome === 'passed').length
  const failed = outcomes.filter((outcome) => outcome === 'failed').length
  const pending = outcomes.filter((outcome) => outcome === 'pending').length
  const summary =
    [failed && `${failed} failing`, passed && `${passed} successful`, pending > 0 && `${pending} pending`].filter(Boolean).join(', ') ||
    `${checks.length} checks`
  return [
    { ...checksPanelNode, childCount: 3 },
    sideHeadingNode,
    text('Checks'),
    checkSummaryNode,
    text(summary),
    {
      childCount: checks.length,
      className: 'PullRequestCheckList',
      type: VirtualDomElements.Div,
    },
    ...checks.flatMap((check, index) => {
      const outcome = outcomes[index]
      const hasLog = canOpenCheckLog(check.detailsUrl)
      return [
        {
          ariaLabel: `${check.name}: ${outcome}`,
          childCount: 2,
          className: mergeClassNames('PullRequestCheck', `PullRequestCheck-${outcome}`),
          disabled: !hasLog,
          name: `openPullRequestCheck:${index}`,
          onClick: DomEventListenerFunctions.HandleClick,
          type: VirtualDomElements.Button,
        },
        checkOutcomeNode,
        text(outcome),
        checkNameNode,
        text(check.name),
      ]
    }),
  ]
}

const getDescriptionChildren = (descriptionVirtualDom: readonly VirtualDomNode[]): readonly VirtualDomNode[] => {
  if (descriptionVirtualDom.length > 0) {
    return descriptionVirtualDom
  }
  return [text('No description')]
}

const canOpenCheckLog = (url: string): boolean => {
  if (!URL.canParse(url)) return false
  const parsedUrl = new URL(url)
  return parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'github.com'
}

export const renderPullRequest = (pullRequest: PullRequestData, descriptionVirtualDom: readonly VirtualDomNode[] = []): readonly VirtualDomNode[] => {
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
    ...getDescriptionChildren(descriptionVirtualDom),
    ...renderChecksPanel(pullRequest),
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
