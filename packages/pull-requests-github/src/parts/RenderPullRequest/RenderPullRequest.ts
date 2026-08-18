import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestData } from '../PullRequestData/PullRequestData.ts'
import { renderField } from '../RenderField/RenderField.ts'

const detailsNode: VirtualDomNode = {
  ariaLabel: 'Overview',
  childCount: 4,
  className: 'PullRequestDetails',
  role: AriaRoles.Panel,
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
