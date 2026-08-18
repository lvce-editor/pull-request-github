import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { renderStatus } from '../RenderStatus/RenderStatus.ts'

const viewNode: VirtualDomNode = {
  childCount: 3,
  className: mergeClassNames('Viewlet', 'PullRequestView'),
  type: VirtualDomElements.Div,
}

const introNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestIntro',
  type: VirtualDomElements.Div,
}

const titleNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestTitle',
  type: VirtualDomElements.H2,
}

const descriptionNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestDescription',
  type: VirtualDomElements.P,
}

const formNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestForm',
  name: 'pullRequestForm',
  onSubmit: DomEventListenerFunctions.HandleSubmit,
  type: VirtualDomElements.Form,
}

const labelNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestLabel',
  htmlFor: 'pullRequestUrl',
  type: VirtualDomElements.Label,
}

const controlsNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestControls',
  type: VirtualDomElements.Div,
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
    introNode,
    titleNode,
    text('Inspect a pull request'),
    descriptionNode,
    text('Paste a GitHub pull request URL to view its title, branches, and description.'),
    formNode,
    labelNode,
    text('Pull request URL'),
    controlsNode,
    {
      childCount: 0,
      className: 'PullRequestInput',
      id: 'pullRequestUrl',
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
