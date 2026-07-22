import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'

const fieldNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestField',
  type: VirtualDomElements.Div,
}

const labelNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestFieldLabel',
  type: VirtualDomElements.Div,
}

const valueNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestFieldValue',
  type: VirtualDomElements.Div,
}

export const renderField = (label: string, value: string): readonly VirtualDomNode[] => {
  return [fieldNode, labelNode, text(label), valueNode, text(value || '-')]
}
