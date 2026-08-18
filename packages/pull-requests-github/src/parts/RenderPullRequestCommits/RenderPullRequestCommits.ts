import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { AriaRoles, text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestCommit } from '../PullRequestData/PullRequestData.ts'

const commitNode: VirtualDomNode = {
  childCount: 3,
  className: 'PullRequestCommit',
  type: VirtualDomElements.Li,
}

const commitMessageNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestCommitMessage',
  type: VirtualDomElements.Span,
}

const commitAuthorNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestCommitAuthor',
  type: VirtualDomElements.Span,
}

const commitShaNode: VirtualDomNode = {
  childCount: 1,
  className: 'PullRequestCommitSha',
  type: VirtualDomElements.Code,
}

const emptyCommitsNode: VirtualDomNode = {
  ariaLabel: 'Commits',
  childCount: 1,
  className: 'PullRequestMessage',
  role: AriaRoles.Panel,
  type: VirtualDomElements.Div,
}

const renderCommit = (commit: PullRequestCommit): readonly VirtualDomNode[] => {
  return [
    commitNode,
    commitMessageNode,
    text(commit.message || 'Untitled commit'),
    commitAuthorNode,
    text(commit.author),
    commitShaNode,
    text(commit.sha.slice(0, 7)),
  ]
}

export const renderPullRequestCommits = (commits: readonly PullRequestCommit[]): readonly VirtualDomNode[] => {
  if (commits.length === 0) {
    return [emptyCommitsNode, text('No commits in this pull request.')]
  }
  return [
    {
      ariaLabel: 'Commits',
      childCount: commits.length,
      className: 'PullRequestCommitList',
      role: AriaRoles.Panel,
      type: VirtualDomElements.Ul,
    },
    ...commits.flatMap(renderCommit),
  ]
}
