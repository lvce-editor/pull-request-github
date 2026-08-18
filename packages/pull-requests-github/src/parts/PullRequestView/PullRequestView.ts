import type { ViewContext, ViewEvent, VirtualDomViewInstance } from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { GitHubRepository } from '../GitHubRepository/GitHubRepository.ts'
import type { PullRequestData } from '../PullRequestData/PullRequestData.ts'
import type { PullRequestFilter } from '../PullRequestFilter/PullRequestFilter.ts'
import type { PullRequestListItem } from '../PullRequestListItem/PullRequestListItem.ts'
import type { PullRequestViewSavedState } from '../PullRequestViewState/PullRequestViewState.ts'
import { getGitHubRepository } from '../GetGitHubRepository/GetGitHubRepository.ts'
import { getPullRequestVirtualDom } from '../GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import * as GitHubWorkerRpc from '../GitHubWorkerRpc/GitHubWorkerRpc.ts'
import * as PullRequestFilters from '../PullRequestFilter/PullRequestFilter.ts'
import * as PullRequestViewStates from '../PullRequestViewState/PullRequestViewState.ts'

interface PullRequestViewInstance extends VirtualDomViewInstance {
  readonly dispose: () => void
  readonly handleEvent: (event: ViewEvent) => Promise<void>
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

  const loadList = async (repository: GitHubRepository, filter: PullRequestFilter, rerender: boolean): Promise<void> => {
    state = {
      ...state,
      error: '',
      filter,
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
      const pullRequests = await dependencies.fetchPullRequests(repository, filter)
      state = {
        ...state,
        pullRequests,
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
    await loadList(repository, filter, rerender)
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
      pullRequest: undefined,
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
      const { pullRequests, repository } = state
      if (name === 'showOpenPullRequests') {
        if (repository) {
          await loadList(repository, PullRequestFilters.Open, false)
        }
        return
      }
      if (name === 'showClosedPullRequests') {
        if (repository) {
          await loadList(repository, PullRequestFilters.Closed, false)
        }
        return
      }
      if (name === 'showPullRequestList') {
        state = {
          ...state,
          pullRequest: undefined,
          screen: PullRequestViewStates.List,
          status: PullRequestViewStates.Ready,
          url: '',
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
          pullRequest,
          screen: PullRequestViewStates.Detail,
          status: PullRequestViewStates.Ready,
          url: pullRequest.url,
        }
      }
    }

    const instance: PullRequestViewInstance = {
      dispose(): void {
        activeInstances.delete(instance)
      },
      async handleEvent(event: ViewEvent): Promise<void> {
        if (event.type !== 'click') {
          return
        }
        if (event.name) {
          await handleClick(event.name)
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
