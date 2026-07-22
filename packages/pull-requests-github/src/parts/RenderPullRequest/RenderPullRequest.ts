import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'
import { renderField } from '../RenderField/RenderField.ts'

const detailsNode: VirtualDomNode = {
  childCount: 4,
  className: 'PullRequestDetails',
  type: VirtualDomElements.Div,
}

export const renderPullRequest = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
  return [
    detailsNode,
    ...renderField('Title', pullRequest.title),
    ...renderField('Head', pullRequest.headBranch),
    ...renderField('Base', pullRequest.baseBranch),
    ...renderField('Description', pullRequest.description || 'No description'),
  ]
}
