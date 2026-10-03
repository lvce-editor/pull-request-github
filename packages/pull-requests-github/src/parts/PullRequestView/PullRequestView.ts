import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import { executeCommand, markdownToVirtualDom, type View, type ViewContext, type ViewEvent, type VirtualDomViewInstance } from '@lvce-editor/api'
import { WhenExpression } from '@lvce-editor/constants'
import {
  Closed,
  pullRequestPageSize,
  type PullRequestPage,
  Open,
  type GitHubRepository,
  type PullRequestData,
  type PullRequestFilter,
  type PullRequestListItem,
} from '@lvce-editor/pull-request-shared'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import type { PullRequestViewSavedState, PullRequestViewState } from '../PullRequestViewState/PullRequestViewState.ts'
import * as CreatePullRequestDependencies from '../CreatePullRequestDependencies/CreatePullRequestDependencies.ts'
import * as CreatePullRequestView from '../CreatePullRequestView/CreatePullRequestView.ts'
import { getErrorInfo } from '../GetErrorInfo/GetErrorInfo.ts'
import { getGitHubRepository } from '../GetGitHubRepository/GetGitHubRepository.ts'
import { getPullRequestVirtualDom } from '../GetPullRequestVirtualDom/GetPullRequestVirtualDom.ts'
import * as GitHubWorkerRpc from '../GitHubWorkerRpc/GitHubWorkerRpc.ts'
import * as PullRequestDetailTabs from '../PullRequestDetailTab/PullRequestDetailTab.ts'
import * as PullRequestViewStates from '../PullRequestViewState/PullRequestViewState.ts'

export interface PullRequestViewInstance extends VirtualDomViewInstance {
  readonly dispose: () => void
  readonly focusCreateControl: (direction: -1 | 1) => Promise<void>
  readonly focusNextCreateControl: () => Promise<void>
  readonly focusPreviousCreateControl: () => Promise<void>
  readonly getComponentState: () => PullRequestViewState
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly handleCreateInput: (name: unknown, value: unknown) => void
  readonly handleEvent: (event: ViewEvent) => Promise<void>
  readonly handlePullRequestBlur: (name: unknown) => void
  readonly handlePullRequestClick: (name: unknown) => Promise<void>
  readonly handlePullRequestFilterInput: (value: unknown) => void
  readonly handlePullRequestFocus: (name: unknown) => Promise<void>
  readonly handlePullRequestSelection: (name: unknown, checked: unknown) => void
  readonly openOnGitHub: (open: (url: string) => Promise<void>) => Promise<void>
  readonly refresh: () => Promise<void>
  readonly render: () => readonly VirtualDomNode[]
  readonly renderFocus: (oldContext: Readonly<Record<string, boolean>>, newContext: Readonly<Record<string, boolean>>) => string
  readonly saveState: () => PullRequestViewSavedState
  readonly setComponentState: (state: PullRequestViewState) => void
  readonly startCreate: () => Promise<void>
}

type PullRequestViewContext = Partial<ViewContext>

interface PullRequestViewDependencies {
  readonly convertMarkdown: (markdown: string) => Promise<readonly VirtualDomNode[]>
  readonly fetchPullRequest: (url: string) => Promise<PullRequestData>
  readonly fetchPullRequestFileDiff: (url: string, filename: string) => Promise<string | undefined>
  readonly fetchPullRequestPage: (repository: GitHubRepository, filter: PullRequestFilter, page: number) => Promise<PullRequestPage>
  readonly getRepository: () => Promise<GitHubRepository>
  readonly getToken?: () => Promise<string>
  readonly mutatePullRequest?: (token: string, action: 'archive' | 'close' | 'unarchive', pullRequestId: string) => Promise<void>
  readonly openExternal?: (url: string) => Promise<void>
}

type ActionTokenResult = Error | string
type PullRequestAction = 'archive' | 'close' | 'unarchive'

const isGitHubCheckUrl = (url: string): boolean => {
  if (!URL.canParse(url)) return false
  const parsedUrl = new URL(url)
  return parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'github.com'
}

const getBulkAction = (name: string): PullRequestAction | undefined => {
  const action = name.slice('bulkPullRequest:'.length)
  return name.startsWith('bulkPullRequest:') && ['archive', 'close', 'unarchive'].includes(action) ? (action as PullRequestAction) : undefined
}

const getPullRequestActionFailure = async (
  dependencies: PullRequestViewDependencies,
  token: string,
  action: PullRequestAction,
  pullRequest: PullRequestListItem,
): Promise<string | undefined> => {
  if (!pullRequest.nodeId) return `Pull request #${pullRequest.number} is missing its GitHub ID.`
  if (!dependencies.mutatePullRequest) return 'Pull request actions are unavailable.'
  try {
    await dependencies.mutatePullRequest(token, action, pullRequest.nodeId)
    return undefined
  } catch (error) {
    return error instanceof Error ? error.message : 'GitHub request failed.'
  }
}

const defaultDependencies: PullRequestViewDependencies = {
  convertMarkdown: markdownToVirtualDom,
  fetchPullRequest: GitHubWorkerRpc.fetchPullRequest,
  fetchPullRequestFileDiff: GitHubWorkerRpc.fetchPullRequestFileDiff,
  fetchPullRequestPage: GitHubWorkerRpc.fetchPullRequestPage,
  getRepository: getGitHubRepository,
  getToken: CreatePullRequestDependencies.dependencies.getToken,
  mutatePullRequest: GitHubWorkerRpc.mutatePullRequest,
}

export const viewId = 'github.pullRequests'
export const contextKeyCreatePullRequestFocus = 'github.pullRequests.createFocus'
export const focusableCreateControlNames = ['base', 'head', 'title', 'description', 'cancelCreatePullRequest', 'submitCreatePullRequest'] as const
const getFocusTargetContextKey = (name: string): string => `${contextKeyCreatePullRequestFocus}.${name}`

const activeInstances = new Set<PullRequestViewInstance>()

const getActiveInstance = (): PullRequestViewInstance | undefined => {
  return [...activeInstances].at(-1)
}

export const createActiveInstance = async (): Promise<void> => {
  await getActiveInstance()?.startCreate()
}

export const refreshActiveInstance = async (): Promise<void> => {
  await getActiveInstance()?.refresh()
}

export const openActiveInstance = async (open: (url: string) => Promise<void>): Promise<void> => {
  await getActiveInstance()?.openOnGitHub(open)
}

export const focusNextActiveInstance = async (): Promise<void> => {
  await getActiveInstance()?.focusNextCreateControl()
}

export const focusPreviousActiveInstance = async (): Promise<void> => {
  await getActiveInstance()?.focusPreviousCreateControl()
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

const matchesPullRequestQuery = (pullRequest: PullRequestListItem, query: string): boolean => {
  const searchable = [
    pullRequest.title,
    pullRequest.author,
    pullRequest.headBranch,
    pullRequest.baseBranch,
    String(pullRequest.number),
    ...(pullRequest.labels ?? []).map((label) => label.name),
  ]
    .join(' ')
    .toLowerCase()
  return searchable.includes(query)
}

export const create = (
  context?: PullRequestViewContext,
  dependencies: PullRequestViewDependencies = defaultDependencies,
): Promise<PullRequestViewInstance> => {
  let listRequest = 0
  let disposed = false
  let creation: ReturnType<typeof CreatePullRequestView.create> | undefined
  let focusedCreateControl = ''
  let createFocusActive = false
  let focusRequested = false
  let state = PullRequestViewStates.createDefaultState(getSavedState(context))

  const requestRerender = async (): Promise<void> => {
    await context?.requestRerender?.()
  }

  const clearCreateFocus = (): void => {
    focusedCreateControl = ''
    createFocusActive = false
    focusRequested = false
  }

  const fetchSecondaryPage = async (repository: GitHubRepository, filter: PullRequestFilter): Promise<PullRequestPage | undefined> => {
    try {
      return await dependencies.fetchPullRequestPage(repository, filter, 1)
    } catch {
      return undefined
    }
  }

  const loadLists = async (repository: GitHubRepository, filter: PullRequestFilter, rerender: boolean, page = 1): Promise<void> => {
    const request = ++listRequest
    state = {
      ...state,
      actionMenuOpen: false,
      closedPullRequests: [],
      descriptionVirtualDom: [],
      detailTab: PullRequestDetailTabs.Overview,
      error: '',
      errorCode: '',
      fileDiffs: {},
      filter,
      openPullRequests: [],
      page,
      pullRequest: undefined,
      pullRequests: [],
      repository,
      screen: PullRequestViewStates.List,
      selectedPullRequestNumbers: [],
      status: PullRequestViewStates.Loading,
      url: '',
    }
    if (rerender) {
      await requestRerender()
    }
    try {
      const secondaryFilter = filter === Open ? Closed : Open
      const [primary, secondary] = await Promise.all([
        dependencies.fetchPullRequestPage(repository, filter, page),
        fetchSecondaryPage(repository, secondaryFilter),
      ])
      if (disposed || request !== listRequest) return
      const lastPage = Math.max(1, Math.ceil(primary.total / pullRequestPageSize))
      if (page > lastPage) {
        await loadLists(repository, filter, rerender, lastPage)
        return
      }
      state = {
        ...state,
        closedCount: filter === Closed ? primary.total : secondary?.total,
        closedPullRequests: filter === Closed ? primary.items : secondary?.items || [],
        openCount: filter === Open ? primary.total : secondary?.total,
        openPullRequests: filter === Open ? primary.items : secondary?.items || [],
        pullRequests: primary.items,
        status: PullRequestViewStates.Ready,
      }
    } catch (error) {
      if (disposed || request !== listRequest) return
      const errorInfo = getErrorInfo(error)
      state = {
        ...state,
        error: errorInfo.message,
        errorCode: errorInfo.code,
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
      errorCode: '',
      fileDiffs: {},
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
      const errorInfo = getErrorInfo(error)
      state = {
        ...state,
        error: errorInfo.message,
        errorCode: errorInfo.code,
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
    const { pullRequest: currentPullRequest, url } = state
    if (!url) {
      await loadRepository(rerender)
      return
    }
    state = {
      ...state,
      descriptionVirtualDom: [],
      error: '',
      errorCode: '',
      fileDiffs: {},
      screen: PullRequestViewStates.Detail,
      status: PullRequestViewStates.Loading,
    }
    if (rerender) {
      await requestRerender()
    }
    try {
      const detail = await dependencies.fetchPullRequest(url)
      const descriptionVirtualDom = detail.description ? await dependencies.convertMarkdown(detail.description) : []
      const { url: currentUrl } = state
      if (currentUrl !== url) {
        return
      }
      const pullRequest: PullRequestData = {
        ...currentPullRequest,
        ...detail,
      }
      state = {
        ...state,
        descriptionVirtualDom,
        pullRequest,
        status: PullRequestViewStates.Ready,
      }
    } catch (error) {
      const { url: currentUrl } = state
      if (currentUrl !== url) {
        return
      }
      const errorInfo = getErrorInfo(error)
      state = {
        ...state,
        error: errorInfo.message,
        errorCode: errorInfo.code,
        status: PullRequestViewStates.Error,
      }
    }
    if (rerender) {
      await requestRerender()
    }
  }

  const loadFileDiff = async (index: number): Promise<void> => {
    const { pullRequest, url } = state
    const currentPullRequest = pullRequest
    const file = currentPullRequest?.files[index]
    if (!file || !url) {
      return
    }
    const { fileDiffs } = state
    const currentDiff = fileDiffs[index]
    if (currentDiff?.status === 'loading' || currentDiff?.status === 'loaded') {
      return
    }
    state = {
      ...state,
      fileDiffs: {
        ...fileDiffs,
        [index]: { status: 'loading' },
      },
    }
    await requestRerender()
    try {
      const patch = await dependencies.fetchPullRequestFileDiff(url, file.filename)
      const { fileDiffs: currentFileDiffs, pullRequest: activePullRequest, url: currentUrl } = state
      if (activePullRequest !== currentPullRequest || currentUrl !== url) {
        return
      }
      state = {
        ...state,
        fileDiffs: {
          ...currentFileDiffs,
          [index]: patch ? { patch, status: 'loaded' } : { status: 'unavailable' },
        },
      }
    } catch {
      const { fileDiffs: currentFileDiffs, pullRequest: activePullRequest, url: currentUrl } = state
      if (activePullRequest !== currentPullRequest || currentUrl !== url) {
        return
      }
      state = {
        ...state,
        fileDiffs: {
          ...currentFileDiffs,
          [index]: { status: 'error' },
        },
      }
    }
    await requestRerender()
  }

  const getActionToken = async (): Promise<ActionTokenResult> => {
    try {
      const token = await dependencies.getToken?.()
      return token || new Error('Sign in to GitHub before changing pull requests.')
    } catch (error) {
      return error instanceof Error ? error : new Error('Could not sign in to GitHub.')
    }
  }

  const runBulkAction = async (action: PullRequestAction): Promise<void> => {
    const { actionPending, closedPullRequests, openPullRequests, selectedPullRequestNumbers } = state
    if (actionPending) return
    const selected = [...openPullRequests, ...closedPullRequests].filter((item) => selectedPullRequestNumbers.includes(item.number))
    state = { ...state, actionError: '', actionMenuOpen: false, actionPending: true }
    await requestRerender()
    const token = await getActionToken()
    if (token instanceof Error) {
      state = { ...state, actionError: token.message, actionPending: false }
      await requestRerender()
      return
    }
    const failures: string[] = []
    let nextOpenPullRequests = [...openPullRequests]
    let nextClosedPullRequests = [...closedPullRequests]
    let nextSelectedPullRequestNumbers = [...selectedPullRequestNumbers]
    for (const pullRequest of selected) {
      const failure = await getPullRequestActionFailure(dependencies, token, action, pullRequest)
      if (failure) {
        failures.push(`#${pullRequest.number}: ${failure}`)
        continue
      }
      nextSelectedPullRequestNumbers = nextSelectedPullRequestNumbers.filter((number) => number !== pullRequest.number)
      nextOpenPullRequests = nextOpenPullRequests.filter((item) => item.number !== pullRequest.number)
      const updated = { ...pullRequest, ...(action === 'archive' && { isArchived: true }), ...(action === 'unarchive' && { isArchived: false }) }
      if (nextClosedPullRequests.every((item) => item.number !== updated.number)) nextClosedPullRequests.push(updated)
      else nextClosedPullRequests = nextClosedPullRequests.map((item) => (item.number === updated.number ? updated : item))
    }
    const { closedCount, filter, openCount } = state
    const closed = openPullRequests.length - nextOpenPullRequests.length
    state = {
      ...state,
      actionError: failures.join(' '),
      actionPending: false,
      closedCount: closedCount === undefined ? undefined : closedCount + closed,
      closedPullRequests: nextClosedPullRequests,
      openCount: openCount === undefined ? undefined : Math.max(0, openCount - closed),
      openPullRequests: nextOpenPullRequests,
      pullRequests: (filter === Closed ? nextClosedPullRequests : nextOpenPullRequests).slice(0, pullRequestPageSize),
      selectedPullRequestNumbers: nextSelectedPullRequestNumbers,
    }
    await requestRerender()
  }

  const runBulkActionByName = async (name: string): Promise<void> => {
    const action = getBulkAction(name)
    if (action) await runBulkAction(action)
  }

  const handleSelectionActionClick = async (name: string): Promise<void> => {
    if (name === 'togglePullRequestActionMenu') {
      const { actionMenuOpen } = state
      state = { ...state, actionMenuOpen: !actionMenuOpen }
      return
    }
    await runBulkActionByName(name)
  }

  const changeFilter = async (filter: PullRequestFilter): Promise<void> => {
    const { closedCount, closedPullRequests, openCount, openPullRequests, page, repository, status } = state
    const items = filter === Open ? openPullRequests : closedPullRequests
    const total = filter === Open ? openCount : closedCount
    if (page === 1 && status === PullRequestViewStates.Ready && total === items.length && total <= pullRequestPageSize) {
      state = { ...state, actionMenuOpen: false, filter, pullRequests: items, selectedPullRequestNumbers: [] }
    } else if (repository) {
      await loadLists(repository, filter, true)
    }
  }

  const changePage = async (nextPage: number): Promise<void> => {
    const { closedCount, filter, openCount, page, repository } = state
    const total = filter === Open ? openCount : closedCount
    if (
      !repository ||
      !Number.isSafeInteger(nextPage) ||
      nextPage < 1 ||
      nextPage > Math.ceil((total || 0) / pullRequestPageSize) ||
      nextPage === page
    )
      return
    await loadLists(repository, filter, true, nextPage)
  }

  const handleListNavigation = async (name: string): Promise<boolean> => {
    if (name === 'showOpenPullRequests' || name === 'showClosedPullRequests') {
      await changeFilter(name === 'showOpenPullRequests' ? Open : Closed)
      return true
    }
    if (name.startsWith('pullRequestPage:')) {
      await changePage(Number(name.slice('pullRequestPage:'.length)))
      return true
    }
    if (name === 'refreshPullRequests') {
      await loadRepository(false)
      return true
    }
    return false
  }

  const createInstance = async (): Promise<PullRequestViewInstance> => {
    await loadRepository(false)
    const openPullRequestCheck = async (name: string): Promise<boolean> => {
      if (!name.startsWith('openPullRequestCheck:')) return false
      const index = Number(name.slice('openPullRequestCheck:'.length))
      const { pullRequest } = state
      const check = pullRequest?.checks?.[index]
      if (check && isGitHubCheckUrl(check.detailsUrl)) {
        const openExternal =
          dependencies.openExternal ??
          (async (url: string): Promise<void> => {
            await executeCommand('Open.openExternal', url)
          })
        await openExternal(check.detailsUrl)
      }
      return true
    }
    const handleClick = async (name: string): Promise<void> => {
      const { actionPending, pullRequests } = state
      if (actionPending) return
      if (await handleListNavigation(name)) return
      if (name === 'togglePullRequestActionMenu' || name.startsWith('bulkPullRequest:')) {
        await handleSelectionActionClick(name)
        return
      }
      if (name === 'showPullRequestList') {
        state = {
          ...state,
          detailTab: PullRequestDetailTabs.Overview,
          fileDiffs: {},
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
      if (name.startsWith('showPullRequestDiff:')) {
        const index = Number(name.slice('showPullRequestDiff:'.length))
        if (Number.isSafeInteger(index) && index >= 0) {
          await loadFileDiff(index)
        }
        return
      }
      if (await openPullRequestCheck(name)) return
      if (name.startsWith('openPullRequest:')) {
        const number = Number(name.slice('openPullRequest:'.length))
        const pullRequest = pullRequests.find((item) => item.number === number)
        if (!pullRequest) {
          return
        }
        state = {
          ...state,
          detailTab: PullRequestDetailTabs.Overview,
          fileDiffs: {},
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
        disposed = true
        listRequest++
        creation?.dispose()
        activeInstances.delete(instance)
      },
      async focusCreateControl(direction: -1 | 1): Promise<void> {
        const currentIndex = focusableCreateControlNames.indexOf(focusedCreateControl as (typeof focusableCreateControlNames)[number])
        const nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + direction + focusableCreateControlNames.length) % focusableCreateControlNames.length
        const name = focusableCreateControlNames[nextIndex]
        focusedCreateControl = name
        createFocusActive = true
        focusRequested = true
        await requestRerender()
      },
      async focusNextCreateControl(): Promise<void> {
        await instance.focusCreateControl(1)
      },
      async focusPreviousCreateControl(): Promise<void> {
        await instance.focusCreateControl(-1)
      },
      getComponentState(): PullRequestViewState {
        return state
      },
      getContext(): Readonly<Record<string, boolean>> {
        if (!createFocusActive || !focusedCreateControl) {
          return {}
        }
        return {
          [contextKeyCreatePullRequestFocus]: true,
          [getFocusTargetContextKey(focusedCreateControl)]: true,
        }
      },
      handleCreateInput(name: unknown, value: unknown): void {
        creation?.input(name, value)
      },
      async handleEvent(event: ViewEvent): Promise<void> {
        if (event.type === 'focus') {
          await instance.handlePullRequestFocus(event.name)
          return
        }
        if (event.type === 'blur') {
          instance.handlePullRequestBlur(event.name)
          return
        }
        if (creation && event.type === 'input') {
          creation.input(event.name, event.value)
          return
        }
        if (event.type === 'input' && event.name === 'filterPullRequests') {
          instance.handlePullRequestFilterInput(event.value)
          return
        }
        if (event.type !== 'click') {
          return
        }
        await instance.handlePullRequestClick(event.name)
      },
      handlePullRequestBlur(name: unknown): void {
        if (name !== focusedCreateControl) {
          return
        }

        focusedCreateControl = ''
        createFocusActive = false
        focusRequested = false
      },
      async handlePullRequestClick(name: unknown): Promise<void> {
        if (typeof name !== 'string') {
          return
        }

        const isCreateField = ['base', 'head', 'title', 'description'].includes(name)
        if (isCreateField) {
          focusedCreateControl = name
          createFocusActive = true
          focusRequested = false
          await RendererWorker.setFocus(WhenExpression.FocusViewletList)
          return
        }

        if (name === 'createPullRequest') {
          await instance.startCreate()
          return
        }
        if (creation) {
          if (name === 'submitCreatePullRequest') await creation.submit()
          if (name === 'cancelCreatePullRequest' && creation.canCancel()) {
            creation.dispose()
            creation = undefined
            clearCreateFocus()
            await requestRerender()
          }
          return
        }
        await handleClick(name)
      },
      handlePullRequestFilterInput(value: unknown): void {
        state = {
          ...state,
          query: typeof value === 'string' ? value : '',
        }
      },
      async handlePullRequestFocus(name: unknown): Promise<void> {
        if (!(typeof name === 'string' && (focusableCreateControlNames as readonly string[]).includes(name))) {
          return
        }

        focusedCreateControl = name
        createFocusActive = true
      },
      handlePullRequestSelection(name: unknown, checked: unknown): void {
        const { pullRequests, query, selectedPullRequestNumbers } = state
        const normalized = query.trim().toLowerCase()
        const visible = pullRequests.filter((pullRequest) => !normalized || matchesPullRequestQuery(pullRequest, normalized))
        const selected = new Set(selectedPullRequestNumbers)
        if (name === 'toggleAllPullRequests') {
          for (const pullRequest of visible) {
            if (checked) selected.add(pullRequest.number)
            else selected.delete(pullRequest.number)
          }
        } else if (typeof name === 'string' && name.startsWith('togglePullRequest:')) {
          const number = Number(name.slice('togglePullRequest:'.length))
          if (checked) selected.add(number)
          else selected.delete(number)
        }
        state = { ...state, actionError: '', selectedPullRequestNumbers: [...selected] }
      },
      async openOnGitHub(open: (url: string) => Promise<void>): Promise<void> {
        const { url } = state
        if (url) {
          await open(url)
        }
      },
      async refresh(): Promise<void> {
        if (creation) return
        const { screen } = state
        if (screen === PullRequestViewStates.Detail) {
          await loadDetail(true)
          return
        }
        await loadRepository(true)
      },
      render(): readonly VirtualDomNode[] {
        return creation ? creation.render() : getPullRequestVirtualDom(state)
      },
      renderFocus(oldContext: Readonly<Record<string, boolean>>, newContext: Readonly<Record<string, boolean>>): string {
        if (
          focusedCreateControl &&
          focusRequested &&
          newContext[getFocusTargetContextKey(focusedCreateControl)] &&
          !oldContext[getFocusTargetContextKey(focusedCreateControl)]
        ) {
          focusRequested = false
          return `[name="${focusedCreateControl}"]`
        }
        return ''
      },
      saveState(): PullRequestViewSavedState {
        const { filter } = state
        return {
          filter,
        }
      },
      setComponentState(newState: PullRequestViewState): void {
        creation?.dispose()
        creation = undefined
        state = newState
      },
      async startCreate(): Promise<void> {
        if (creation) return
        const currentCreation = CreatePullRequestView.create(requestRerender, CreatePullRequestDependencies.dependencies, async () => {
          if (disposed || creation !== currentCreation) return
          creation.dispose()
          creation = undefined
          clearCreateFocus()
          await loadRepository(true)
        })
        creation = currentCreation
        await requestRerender()
        await currentCreation.initialize()
      },
    }
    activeInstances.add(instance)
    return instance
  }
  return createInstance()
}

export const view: View<PullRequestViewInstance, PullRequestViewState> = {
  create,
  displayName: 'Pull Requests',
  eventListeners: [
    {
      name: 'handlePullRequestFocus',
      params: ['handlePullRequestFocus', 'event.currentTarget.name'],
    },
    {
      name: 'handlePullRequestBlur',
      params: ['handlePullRequestBlur', 'event.currentTarget.name'],
    },
    { name: 'handleCreateInput', params: ['handleCreateInput', 'event.currentTarget.name', 'event.currentTarget.value'] },
    {
      name: 'handlePullRequestClick',
      params: ['handlePullRequestClick', 'event.currentTarget.name'],
    },
    {
      name: 'handlePullRequestFilterInput',
      params: ['handlePullRequestFilterInput', 'event.currentTarget.value'],
    },
    { name: 'handlePullRequestSelection', params: ['handlePullRequestSelection', 'event.currentTarget.name', 'event.currentTarget.checked'] },
  ],
  getComponentState: (instance) => instance.getComponentState(),
  icon: 'media/git-pull-request.svg',
  id: viewId,
  kind: 'virtualDom',
  setComponentState: (instance, state) => instance.setComponentState(state),
  title: 'Pull Requests',
}
