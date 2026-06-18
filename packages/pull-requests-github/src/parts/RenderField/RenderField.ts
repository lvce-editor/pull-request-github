import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'

export const renderField = (label: string, value: string): readonly VirtualDomNode[] => {
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
