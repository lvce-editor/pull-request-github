import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { fetchPullRequest } from '../GitHubPullRequest/GitHubPullRequest.ts'
import { getPullRequestVirtualDom } from '../GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import type { PullRequestViewSavedState, PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as PullRequestViewStatus from '../PullRequestViewState/PullRequestViewState.ts'

interface ViewContext {
  readonly state?: unknown
}

interface ViewEvent {
  readonly name?: string
  readonly type: string
  readonly value?: unknown
}

interface VirtualDomViewInstance {
  readonly handleEvent: (event: ViewEvent) => Promise<void>
  readonly render: () => readonly VirtualDomNode[]
  readonly saveState: () => PullRequestViewSavedState
}

const isSavedState = (value: unknown): value is PullRequestViewSavedState => {
  return Boolean(value && typeof value === 'object')
}

const getSavedState = (context: ViewContext | undefined): PullRequestViewSavedState | undefined => {
  if (!isSavedState(context?.state)) {
    return undefined
  }
  return context.state
}

const loadPullRequest = async (state: PullRequestViewState): Promise<PullRequestViewState> => {
  try {
    const pullRequest = await fetchPullRequest(state.url)
    return {
      ...state,
      error: '',
      pullRequest,
      status: PullRequestViewStatus.Ready,
    }
  } catch (error) {
    return {
      ...state,
      error: error instanceof Error ? error.message : `${error}`,
      pullRequest: undefined,
      status: PullRequestViewStatus.Error,
    }
  }
}

export const create = (context?: ViewContext): VirtualDomViewInstance => {
  let state = PullRequestViewStatus.createDefaultState(getSavedState(context))
  return {
    async handleEvent(event: ViewEvent): Promise<void> {
      if (event.type === 'input' && event.name === 'pullRequestUrl') {
        state = {
          ...state,
          url: typeof event.value === 'string' ? event.value : '',
        }
        return
      }
      if ((event.type === 'click' && event.name === 'loadPullRequest') || event.type === 'submit') {
        state = {
          ...state,
          error: '',
          pullRequest: undefined,
          status: PullRequestViewStatus.Loading,
        }
        state = await loadPullRequest(state)
      }
    },
    render() {
      return getPullRequestVirtualDom(state)
    },
    saveState(): PullRequestViewSavedState {
      return {
        url: state.url,
      }
    },
  }
}
