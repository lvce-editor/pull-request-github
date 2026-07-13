import type { ViewContext, ViewEvent, VirtualDomViewInstance } from '@lvce-editor/api'
import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { PullRequestViewSavedState, PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import { getPullRequestVirtualDom } from '../GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import { fetchPullRequest } from '../GitHubPullRequest/GitHubPullRequest.ts'
import * as PullRequestViewStatus from '../PullRequestViewState/PullRequestViewState.ts'

interface PullRequestViewInstance extends VirtualDomViewInstance {
  readonly dispose: () => void
  readonly handleEvent: (event: ViewEvent) => Promise<void>
  readonly openOnGitHub: (open: (url: string) => Promise<void>) => Promise<void>
  readonly refresh: () => Promise<void>
  readonly render: () => readonly VirtualDomNode[]
  readonly saveState: () => PullRequestViewSavedState
}

type PullRequestViewContext = Partial<ViewContext>

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

const loadPullRequest = async (state: PullRequestViewState): Promise<PullRequestViewState> => {
  const { url } = state
  try {
    const pullRequest = await fetchPullRequest(url)
    return {
      ...state,
      error: '',
      pullRequest,
      status: PullRequestViewStatus.Ready,
    }
  } catch (error) {
    return {
      ...state,
      error: error instanceof Error ? error.message : String(error),
      pullRequest: undefined,
      status: PullRequestViewStatus.Error,
    }
  }
}

export const create = (context?: PullRequestViewContext): PullRequestViewInstance => {
  let state = PullRequestViewStatus.createDefaultState(getSavedState(context))

  const requestRerender = async (): Promise<void> => {
    await context?.requestRerender?.()
  }

  const refresh = async (rerender: boolean): Promise<void> => {
    state = {
      ...state,
      error: '',
      pullRequest: undefined,
      status: PullRequestViewStatus.Loading,
    }
    if (rerender) {
      await requestRerender()
    }
    state = await loadPullRequest(state)
    if (rerender) {
      await requestRerender()
    }
  }

  const instance: PullRequestViewInstance = {
    dispose(): void {
      activeInstances.delete(instance)
    },
    async handleEvent(event: ViewEvent): Promise<void> {
      if (event.type === 'input' && event.name === 'pullRequestUrl') {
        state = {
          ...state,
          url: typeof event.value === 'string' ? event.value : '',
        }
        return
      }
      if ((event.type === 'click' && event.name === 'loadPullRequest') || event.type === 'submit') {
        await refresh(false)
      }
    },
    async openOnGitHub(open: (url: string) => Promise<void>): Promise<void> {
      const { url } = state
      if (!url) {
        return
      }
      await open(url)
    },
    async refresh(): Promise<void> {
      await refresh(true)
    },
    render(): readonly VirtualDomNode[] {
      return getPullRequestVirtualDom(state)
    },
    saveState(): PullRequestViewSavedState {
      const { url } = state
      return {
        url,
      }
    },
  }
  activeInstances.add(instance)
  return instance
}
