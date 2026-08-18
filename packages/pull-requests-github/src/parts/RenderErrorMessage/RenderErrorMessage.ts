import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { ErrorCodes } from '@lvce-editor/pull-request-shared'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'

const errorMessageNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestErrorMessage',
  type: VirtualDomElements.Span,
}

const errorCodeNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestErrorCode',
  type: VirtualDomElements.Code,
}

export const renderErrorMessage = (message: string, code: string, emphasized = true): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: mergeClassNames('PullRequestMessage', 'PullRequestMessageWithErrorCode', emphasized ? 'PullRequestMessageError' : ''),
      role: emphasized ? AriaRoles.Alert : AriaRoles.Status,
      type: VirtualDomElements.Div,
    },
    errorMessageNode,
    text(message || 'An unknown error occurred.'),
    errorCodeNode,
    text(`Error code: ${code || ErrorCodes.Unknown}`),
  ]
}
