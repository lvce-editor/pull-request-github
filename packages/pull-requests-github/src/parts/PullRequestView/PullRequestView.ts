import type { View, ViewContext, ViewEvent, VirtualDomViewInstance } from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import {
  Closed,
  Open,
  type GitHubRepository,
  type PullRequestData,
  type PullRequestFilter,
  type PullRequestListItem,
} from '@lvce-editor/pull-request-shared'
import type { PullRequestViewSavedState } from '../PullRequestViewState/PullRequestViewState.ts'
import { getGitHubRepository } from '../GetGitHubRepository/GetGitHubRepository.ts'
import { getPullRequestVirtualDom } from '../GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import * as GitHubWorkerRpc from '../GitHubWorkerRpc/GitHubWorkerRpc.ts'
import * as PullRequestDetailTabs from '../PullRequestDetailTab/PullRequestDetailTab.ts'
import * as PullRequestViewStates from '../PullRequestViewState/PullRequestViewState.ts'

export interface PullRequestViewInstance extends VirtualDomViewInstance {
  readonly dispose: () => void
  readonly handleEvent: (event: ViewEvent) => Promise<void>
  readonly handlePullRequestClick: (name: unknown) => Promise<void>
  readonly handlePullRequestFilterInput: (value: unknown) => void
  readonly openOnGitHub: (open: (url: string) => Promise<void>) => Promise<void>
  readonly refresh: () => Promise<void>
  readonly render: () => readonly VirtualDomNode[]
  readonly saveState: () => PullRequestViewSavedState
}

type PullRequestViewContext = Partial<ViewContext>

interface PullRequestViewDependencies {
  readonly fetchPullRequest: (url: string) => Promise<PullRequestData>
  readonly fetchPullRequests: (repository: GitHubRepository, filter: PullRequestFilter) => Promise<readonly PullRequestListItem[]>
  readonly getRepository: () => Promise<GitHubRepository>
}

const defaultDependencies: PullRequestViewDependencies = {
  fetchPullRequest: GitHubWorkerRpc.fetchPullRequest,
  fetchPullRequests: GitHubWorkerRpc.fetchPullRequests,
  getRepository: getGitHubRepository,
}

export const viewId = 'github.pullRequests'

const activeInstances = new Set<PullRequestViewInstance>()

const getActiveInstance = (): PullRequestViewInstance | undefined => {
  return [...activeInstances].at(-1)
}

export const refreshActiveInstance = async (): Promise<void> => {
  await getActiveInstance()?.refresh()
}

export const openActiveInstance = async (open: (url: string) => Promise<void>): Promise<void> => {
  await getActiveInstance()?.openOnGitHub(open)
}

const isSavedState = (value: unknown): value is PullRequestViewSavedState => {
  return Boolean(value && typeof value === 'object')
}

const getSavedState = (context: PullRequestViewContext | undefined): PullRequestViewSavedState | undefined => {
  if (!isSavedState(context?.state)) {
    return undefined
  }
  return context.state
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error)
}

export const create = (
  context?: PullRequestViewContext,
  dependencies: PullRequestViewDependencies = defaultDependencies,
): Promise<PullRequestViewInstance> => {
  let state = PullRequestViewStates.createDefaultState(getSavedState(context))

  const requestRerender = async (): Promise<void> => {
    await context?.requestRerender?.()
  }

  const loadLists = async (repository: GitHubRepository, filter: PullRequestFilter, rerender: boolean): Promise<void> => {
    state = {
      ...state,
      closedPullRequests: [],
      detailTab: PullRequestDetailTabs.Overview,
      error: '',
      filter,
      openPullRequests: [],
      pullRequest: undefined,
      pullRequests: [],
      repository,
      screen: PullRequestViewStates.List,
      status: PullRequestViewStates.Loading,
      url: '',
    }
    if (rerender) {
      await requestRerender()
    }
    try {
      const fetchList = async (listFilter: PullRequestFilter): Promise<readonly PullRequestListItem[]> => {
        const pullRequests = await dependencies.fetchPullRequests(repository, listFilter)
        return Array.isArray(pullRequests) ? pullRequests : []
      }
      const secondaryFilter = filter === Open ? Closed : Open
      const fetchSecondaryList = async (): Promise<readonly PullRequestListItem[]> => {
        try {
          return await fetchList(secondaryFilter)
        } catch {
          return []
        }
      }
      const [primaryPullRequests, secondaryPullRequests] = await Promise.all([fetchList(filter), fetchSecondaryList()])
      const openPullRequests = filter === Open ? primaryPullRequests : secondaryPullRequests
      const closedPullRequests = filter === Closed ? primaryPullRequests : secondaryPullRequests
      state = {
        ...state,
        closedPullRequests,
        openPullRequests,
        pullRequests: filter === Closed ? closedPullRequests : openPullRequests,
        status: PullRequestViewStates.Ready,
      }
    } catch (error) {
      state = {
        ...state,
        error: getErrorMessage(error),
        status: PullRequestViewStates.Error,
      }
    }
    if (rerender) {
      await requestRerender()
    }
  }

  const loadRepository = async (rerender: boolean): Promise<void> => {
    state = {
      ...state,
      detailTab: PullRequestDetailTabs.Overview,
      error: '',
      pullRequest: undefined,
      pullRequests: [],
      repository: undefined,
      screen: PullRequestViewStates.List,
      status: PullRequestViewStates.Loading,
      url: '',
    }
    if (rerender) {
      await requestRerender()
    }
    let repository: GitHubRepository
    try {
      repository = await dependencies.getRepository()
    } catch (error) {
      state = {
        ...state,
        error: getErrorMessage(error),
        status: PullRequestViewStates.Unavailable,
      }
      if (rerender) {
        await requestRerender()
      }
      return
    }
    const { filter } = state
    await loadLists(repository, filter, rerender)
  }

  const loadDetail = async (rerender: boolean): Promise<void> => {
    const { url } = state
    if (!url) {
      await loadRepository(rerender)
      return
    }
    state = {
      ...state,
      error: '',
      screen: PullRequestViewStates.Detail,
      status: PullRequestViewStates.Loading,
    }
    if (rerender) {
      await requestRerender()
    }
    try {
      const pullRequest = await dependencies.fetchPullRequest(url)
      state = {
        ...state,
        pullRequest,
        status: PullRequestViewStates.Ready,
      }
    } catch (error) {
      state = {
        ...state,
        error: getErrorMessage(error),
        status: PullRequestViewStates.Error,
      }
    }
    if (rerender) {
      await requestRerender()
    }
  }

  const createInstance = async (): Promise<PullRequestViewInstance> => {
    await loadRepository(false)
    const handleClick = async (name: string): Promise<void> => {
      const { closedPullRequests, openPullRequests, pullRequests } = state
      if (name === 'showOpenPullRequests') {
        state = {
          ...state,
          filter: Open,
          pullRequests: openPullRequests,
        }
        return
      }
      if (name === 'showClosedPullRequests') {
        state = {
          ...state,
          filter: Closed,
          pullRequests: closedPullRequests,
        }
        return
      }
      if (name === 'refreshPullRequests') {
        await loadRepository(false)
        return
      }
      if (name === 'showPullRequestList') {
        state = {
          ...state,
          detailTab: PullRequestDetailTabs.Overview,
          pullRequest: undefined,
          screen: PullRequestViewStates.List,
          status: PullRequestViewStates.Ready,
          url: '',
        }
        return
      }
      if (name === 'showPullRequestOverview') {
        state = {
          ...state,
          detailTab: PullRequestDetailTabs.Overview,
        }
        return
      }
      if (name === 'showPullRequestCommits') {
        state = {
          ...state,
          detailTab: PullRequestDetailTabs.Commits,
        }
        return
      }
      if (name === 'showPullRequestChanges') {
        state = {
          ...state,
          detailTab: PullRequestDetailTabs.Changes,
        }
        return
      }
      if (name.startsWith('openPullRequest:')) {
        const number = Number(name.slice('openPullRequest:'.length))
        const pullRequest = pullRequests.find((item) => item.number === number)
        if (!pullRequest) {
          return
        }
        state = {
          ...state,
          detailTab: PullRequestDetailTabs.Overview,
          pullRequest: {
            ...pullRequest,
            commits: [],
            files: [],
          },
          screen: PullRequestViewStates.Detail,
          url: pullRequest.url,
        }
        await loadDetail(false)
      }
    }

    const instance: PullRequestViewInstance = {
      dispose(): void {
        activeInstances.delete(instance)
      },
      async handleEvent(event: ViewEvent): Promise<void> {
        if (event.type === 'input' && event.name === 'filterPullRequests') {
          instance.handlePullRequestFilterInput(event.value)
          return
        }
        if (event.type !== 'click') {
          return
        }
        await instance.handlePullRequestClick(event.name)
      },
      async handlePullRequestClick(name: unknown): Promise<void> {
        if (typeof name === 'string') {
          await handleClick(name)
        }
      },
      handlePullRequestFilterInput(value: unknown): void {
        state = {
          ...state,
          query: typeof value === 'string' ? value : '',
        }
      },
      async openOnGitHub(open: (url: string) => Promise<void>): Promise<void> {
        const { url } = state
        if (url) {
          await open(url)
        }
      },
      async refresh(): Promise<void> {
        const { screen } = state
        if (screen === PullRequestViewStates.Detail) {
          await loadDetail(true)
          return
        }
        await loadRepository(true)
      },
      render(): readonly VirtualDomNode[] {
        return getPullRequestVirtualDom(state)
      },
      saveState(): PullRequestViewSavedState {
        const { filter } = state
        return {
          filter,
        }
      },
    }
    activeInstances.add(instance)
    return instance
  }
  return createInstance()
}

export const view: View<PullRequestViewInstance> = {
  create,
  displayName: 'Pull Requests',
  eventListeners: [
    {
      name: 'handlePullRequestClick',
      params: ['handlePullRequestClick', 'event.currentTarget.name'],
    },
    {
      name: 'handlePullRequestFilterInput',
      params: ['handlePullRequestFilterInput', 'event.currentTarget.value'],
    },
  ],
  icon: 'media/git-pull-request.svg',
  id: viewId,
  kind: 'virtualDom',
  title: 'Pull Requests',
}
