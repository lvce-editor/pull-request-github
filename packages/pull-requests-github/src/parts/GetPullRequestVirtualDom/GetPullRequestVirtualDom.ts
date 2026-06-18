import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import { renderStatus } from '../RenderStatus/RenderStatus.ts'

export const getPullRequestVirtualDom = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const statusDom = renderStatus(state)
  return [
    {
      childCount: 2,
      className: 'PullRequestView',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'PullRequestForm',
      name: 'pullRequestForm',
      onSubmit: 'handleSubmit',
      type: VirtualDomElements.Form,
    },
    {
      childCount: 0,
      className: 'PullRequestInput',
      name: 'pullRequestUrl',
      onBlur: 'handleBlur',
      onFocus: 'handleFocus',
      onInput: 'handleInput',
      placeholder: 'https://github.com/owner/repo/pull/123',
      type: VirtualDomElements.Input,
      value: state.url,
    },
    {
      childCount: 1,
      className: 'PullRequestButton',
      name: 'loadPullRequest',
      onClick: 'handleClick',
      type: VirtualDomElements.Button,
    },
    text('Load'),
    ...statusDom,
  ]
}
