import type { PullRequestFile } from '@lvce-editor/pull-request-shared'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'

const diffUnavailableNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestDiffUnavailable',
  type: VirtualDomElements.Div,
}

const fileNode: VirtualDomNode = {
  childCount: 2,
  className: 'PullRequestFile',
  type: VirtualDomElements.Article,
}

const fileHeaderNode: VirtualDomNode = {
  childCount: 4,
  className: 'PullRequestFileHeader',
  type: VirtualDomElements.Header,
}

const fileNameNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestFileName',
  type: VirtualDomElements.Code,
}

const fileStatusNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestFileStatus',
  type: VirtualDomElements.Span,
}

const fileAdditionsNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestFileAdditions',
  type: VirtualDomElements.Span,
}

const fileDeletionsNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestFileDeletions',
  type: VirtualDomElements.Span,
}

const emptyChangesNode: VirtualDomNode = {
  ariaLabel: 'Changes',
  childCount: 1,
  className: 'PullRequestMessage',
  role: AriaRoles.Panel,
  type: VirtualDomElements.Div,
}

const getDiffLineClassName = (line: string): string => {
  if (line.startsWith('@@')) {
    return 'PullRequestDiffLineHunk'
  }
  if (line.startsWith('+')) {
    return 'PullRequestDiffLineAddition'
  }
  if (line.startsWith('-')) {
    return 'PullRequestDiffLineDeletion'
  }
  return 'PullRequestDiffLineContext'
}

const renderPatch = (patch: string): readonly VirtualDomNode[] => {
  if (!patch) {
    return [diffUnavailableNode, text('Diff not available for this file.')]
  }
  const lines = patch.split('\n')
  return [
    {
      childCount: lines.length,
      className: 'PullRequestDiff',
      type: VirtualDomElements.Pre,
    },
    ...lines.flatMap((line) => [
      {
        childCount: 1,
        className: mergeClassNames('PullRequestDiffLine', getDiffLineClassName(line)),
        type: VirtualDomElements.Span,
      },
      text(line || ' '),
    ]),
  ]
}

const renderFile = (file: PullRequestFile): readonly VirtualDomNode[] => {
  return [
    fileNode,
    fileHeaderNode,
    fileNameNode,
    text(file.filename),
    fileStatusNode,
    text(file.status || 'modified'),
    fileAdditionsNode,
    text(`+${file.additions}`),
    fileDeletionsNode,
    text(`−${file.deletions}`),
    ...renderPatch(file.patch),
  ]
}

export const renderPullRequestChanges = (files: readonly PullRequestFile[]): readonly VirtualDomNode[] => {
  if (files.length === 0) {
    return [emptyChangesNode, text('No changed files in this pull request.')]
  }
  return [
    {
      ariaLabel: 'Changes',
      childCount: files.length,
      className: 'PullRequestFileList',
      role: AriaRoles.Panel,
      type: VirtualDomElements.Section,
    },
    ...files.flatMap(renderFile),
  ]
}
