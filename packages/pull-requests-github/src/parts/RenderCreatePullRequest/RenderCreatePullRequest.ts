import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements as E } from '@lvce-editor/virtual-dom-worker'
import type { CreateState } from '../CreatePullRequestView/CreatePullRequestView.ts'
import * as Events from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const createViewClassName = mergeClassNames('Viewlet', 'PullRequestView', 'PullRequestCreateView')

const heading: VirtualDomNode = { childCount: 1, className: 'PullRequestTitle', type: E.H2 }
const repositoryLabel: VirtualDomNode = { childCount: 1, className: 'PullRequestDescription', type: E.P }
const statusNode: VirtualDomNode = { childCount: 1, role: AriaRoles.Status, type: E.Div }
const errorNode: VirtualDomNode = {
  childCount: 1,
  className: mergeClassNames('PullRequestMessage', 'PullRequestMessageError'),
  role: AriaRoles.Alert,
  type: E.Div,
}
const actions: VirtualDomNode = { childCount: 2, className: 'PullRequestCreateActions', type: E.Div }
const button = (name: string, label: string, disabled = false): readonly VirtualDomNode[] => [
  { childCount: 1, className: 'PullRequestCreateButton', disabled, name, onClick: Events.HandleClick, type: E.Button },
  text(label),
]
const field = (state: CreateState, name: 'base' | 'head' | 'title' | 'description', label: string): readonly VirtualDomNode[] => {
  const { busy, loading, number } = state
  return [
    { childCount: 2, className: name === 'description' ? 'PullRequestCreateDescription' : 'PullRequestCreateField', type: E.Label },
    text(label),
    {
      ariaLabel: label,
      childCount: 0,
      className: 'PullRequestCreateInput',
      disabled: loading || busy || Boolean(number),
      name,
      onInput: Events.HandleCreateInput,
      type: name === 'description' ? E.TextArea : E.Input,
      value: state[name],
    },
  ]
}
const renderError = (error: string): readonly VirtualDomNode[] => (error ? [errorNode, text(error)] : [])
const renderLink = (number: number, url: string): readonly VirtualDomNode[] => {
  if (!number) return []
  return [
    { childCount: 1, className: 'PullRequestCreatedLink', href: url, rel: 'noopener noreferrer', target: '_blank', type: E.A },
    text(`Open pull request #${number}`),
  ]
}
const statusMessage = (loading: boolean, busy: boolean, autoMerge: boolean): string => {
  if (loading) return 'Loading repository…'
  if (busy) return 'Creating pull request and enabling auto-squash…'
  return autoMerge ? 'Pull request created. Auto-squash enabled.' : ''
}
export const renderCreatePullRequest = (state: CreateState): readonly VirtualDomNode[] => {
  const { autoMerge, busy, error, loading, number, repository, url } = state
  return [
    {
      childCount: 8 + Number(Boolean(error)) + Number(Boolean(number)),
      className: createViewClassName,
      type: E.Div,
    },
    heading,
    text('Create Pull Request'),
    repositoryLabel,
    text(repository || 'Current workspace'),
    ...field(state, 'base', 'Base branch'),
    ...field(state, 'head', 'Merge branch'),
    ...field(state, 'title', 'Title'),
    ...field(state, 'description', 'Description'),
    statusNode,
    text(statusMessage(loading, busy, autoMerge)),
    ...renderError(error),
    ...renderLink(number, url),
    actions,
    ...button('cancelCreatePullRequest', number ? 'Done' : 'Cancel', busy),
    ...button('submitCreatePullRequest', number && !autoMerge ? 'Retry Auto-Squash' : 'Create + Auto-Squash', loading || busy || autoMerge),
  ]
}
