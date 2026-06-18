import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestData } from '../GitHubPullRequest/GitHubPullRequest.ts'
import type { PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as PullRequestViewStatus from '../PullRequestViewState/PullRequestViewState.ts'

const renderField = (label: string, value: string): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'PullRequestField',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'PullRequestFieldLabel',
      type: VirtualDomElements.Div,
    },
    text(label),
    {
      childCount: 1,
      className: 'PullRequestFieldValue',
      type: VirtualDomElements.Div,
    },
    text(value || '-'),
  ]
}

const renderPullRequest = (pullRequest: PullRequestData): readonly VirtualDomNode[] => {
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

const renderStatus = (state: PullRequestViewState): readonly VirtualDomNode[] => {
  if (state.status === PullRequestViewStatus.Loading) {
    return [
      {
        childCount: 1,
        className: 'PullRequestMessage',
        type: VirtualDomElements.Div,
      },
      text('Loading pull request...'),
    ]
  }
  if (state.status === PullRequestViewStatus.Error) {
    return [
      {
        childCount: 1,
        className: 'PullRequestMessage PullRequestMessageError',
        type: VirtualDomElements.Div,
      },
      text(state.error),
    ]
  }
  if (state.status === PullRequestViewStatus.Ready && state.pullRequest) {
    return renderPullRequest(state.pullRequest)
  }
  return [
    {
      childCount: 1,
      className: 'PullRequestMessage',
      type: VirtualDomElements.Div,
    },
    text('Enter a GitHub pull request URL.'),
  ]
}

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
