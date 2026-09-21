import type { PullRequestFile } from '@lvce-editor/pull-request-shared'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, mergeClassNames, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestFileDiffState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'

const diffUnavailableNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestDiffUnavailable',
  type: VirtualDomElements.Div,
}

const diffActionButtonNode: VirtualDomNode = {
  ariaLabel: 'Show diff anyway',
  childCount: 1,
  className: 'PullRequestDiffAction',
  onClick: DomEventListenerFunctions.HandleClick,
  type: VirtualDomElements.Button,
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

const renderDiffAction = (index: number, label: string): readonly VirtualDomNode[] => {
  return [
    {
      ...diffActionButtonNode,
      ariaLabel: label,
      name: `showPullRequestDiff:${index}`,
    },
    text(label),
  ]
}

const renderMissingPatch = (index: number, state: PullRequestFileDiffState | undefined): readonly VirtualDomNode[] => {
  if (!state) {
    return [diffUnavailableNode, text('Large or generated diffs are hidden by default.'), ...renderDiffAction(index, 'Show anyway')]
  }
  const { patch, status } = state
  if (status === 'hidden') {
    return [diffUnavailableNode, text('Large or generated diffs are hidden by default.'), ...renderDiffAction(index, 'Show anyway')]
  }
  if (status === 'loading') {
    return [diffUnavailableNode, text('Loading diff…')]
  }
  if (status === 'error') {
    return [diffUnavailableNode, text('Unable to load the diff.'), ...renderDiffAction(index, 'Try again')]
  }
  if (status === 'loaded' && patch) {
    return renderPatch(patch)
  }
  return [diffUnavailableNode, text('Diff not available for this file.')]
}

const renderFileDiff = (
  file: PullRequestFile,
  index: number,
  diffStates: Readonly<Record<number, PullRequestFileDiffState>>,
): readonly VirtualDomNode[] => {
  return file.patch ? renderPatch(file.patch) : renderMissingPatch(index, diffStates[index])
}

const renderFile = (
  file: PullRequestFile,
  index: number,
  diffStates: Readonly<Record<number, PullRequestFileDiffState>>,
): readonly VirtualDomNode[] => {
  const diffState = diffStates[index]
  const hasDiffAction = !file.patch && (!diffState || diffState.status === 'hidden' || diffState.status === 'error')
  return [
    { ...fileNode, childCount: hasDiffAction ? 3 : 2 },
    fileHeaderNode,
    fileNameNode,
    text(file.filename),
    fileStatusNode,
    text(file.status || 'modified'),
    fileAdditionsNode,
    text(`+${file.additions}`),
    fileDeletionsNode,
    text(`−${file.deletions}`),
    ...renderFileDiff(file, index, diffStates),
  ]
}

export const renderPullRequestChanges = (
  files: readonly PullRequestFile[],
  diffStates: Readonly<Record<number, PullRequestFileDiffState>> = {},
): readonly VirtualDomNode[] => {
  if (files.length === 0) {
    return [emptyChangesNode, text('No changed files in this pull request.')]
  }
  const resolvedDiffStates = diffStates ?? {}
  return [
    {
      ariaLabel: 'Changes',
      childCount: files.length,
      className: 'PullRequestFileList',
      role: AriaRoles.Panel,
      type: VirtualDomElements.Section,
    },
    ...files.flatMap((file, index) => renderFile(file, index, resolvedDiffStates)),
  ]
}
