import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'
import { renderField } from '../RenderField/RenderField.ts'

export const renderPullRequest = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 4,
      className: 'PullRequestDetails',
      type: VirtualDomElements.Div,
    },
    ...renderField('Title', pullRequest.title),
    ...renderField('Head', pullRequest.headBranch),
    ...renderField('Base', pullRequest.baseBranch),
    ...renderField('Description', pullRequest.description || 'No description'),
  ]
}
