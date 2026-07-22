import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { renderStatus } from '../RenderStatus/RenderStatus.ts'

const viewNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestView',
  type: VirtualDomElements.Div,
}

const formNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestForm',
  name: 'pullRequestForm',
  onSubmit: DomEventListenerFunctions.HandleSubmit,
  type: VirtualDomElements.Form,
}

const buttonNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestButton',
  name: 'loadPullRequest',
  onClick: DomEventListenerFunctions.HandleClick,
  type: VirtualDomElements.Button,
}

export const getPullRequestVirtualDom = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  const { url } = state
  const statusDom = renderStatus(state)
  return [
    viewNode,
    formNode,
    {
      childCount: 0,
      className: 'PullRequestInput',
      name: 'pullRequestUrl',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: 'https://github.com/owner/repo/pull/123',
      type: VirtualDomElements.Input,
      value: url,
    },
    buttonNode,
    text('Load'),
    ...statusDom,
  ]
}
