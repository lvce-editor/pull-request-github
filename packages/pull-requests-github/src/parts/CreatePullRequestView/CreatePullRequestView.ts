import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'
import type { Dependencies } from '../CreatePullRequestDependencies/CreatePullRequestDependencies.ts'
import { dependencies as defaultDependencies, getRepository } from '../CreatePullRequestDependencies/CreatePullRequestDependencies.ts'
import { renderCreatePullRequest } from '../RenderCreatePullRequest/RenderCreatePullRequest.ts'

export interface CreateState {
  readonly autoMerge: boolean
  readonly base: string
  readonly busy: boolean
  readonly description: string
  readonly error: string
  readonly head: string
  readonly loading: boolean
  readonly number: number
  readonly repository: string
  readonly title: string
  readonly url: string
}
export interface CreationView {
  readonly canCancel: () => boolean
  readonly dispose: () => void
  readonly initialize: () => Promise<void>
  readonly input: (name: unknown, value: unknown) => void
  readonly render: () => readonly VirtualDomNode[]
  readonly submit: () => Promise<void>
}
export const create = (rerender: () => Promise<void>, dependencies: Dependencies = defaultDependencies): CreationView => {
  let disposed = false
  let state: CreateState = {
    autoMerge: false,
    base: '',
    busy: false,
    description: '',
    error: '',
    head: '',
    loading: true,
    number: 0,
    repository: '',
    title: '',
    url: '',
  }
  const update = async (patch: Partial<CreateState>): Promise<void> => {
    if (disposed) return
    state = { ...state, ...patch }
    await rerender()
  }
  const initialize = async (): Promise<void> => {
    try {
      const defaults = await dependencies.getDefaults()
      if (disposed) return
      const repository = getRepository(defaults.remoteUrl)
      let base = defaults.baseBranch
      if (!base) {
        const value = await dependencies.request(await dependencies.getToken(), `/repository?repository=${encodeURIComponent(repository)}`)
        if (typeof value.defaultBranch !== 'string' || !value.defaultBranch) throw new Error('GitHub did not return a default branch.')
        base = value.defaultBranch
      }
      await update({ base, head: defaults.headBranch, loading: false, repository, title: defaults.title })
    } catch (error) {
      await update({ error: error instanceof Error ? error.message : String(error), loading: false })
    }
  }
  const submit = async (): Promise<void> => {
    const { autoMerge, busy, loading, number: previousNumber } = state
    if (disposed || busy || loading || autoMerge) return
    const { base, description, head, repository, title } = state
    if (!repository || !base.trim() || !head.trim() || !title.trim()) {
      await update({ error: 'Repository, base branch, merge branch, and title are required.' })
      return
    }
    if (base.trim() === head.trim()) {
      await update({ error: 'Base and merge branches must be different.' })
      return
    }
    state = { ...state, busy: true, error: '' }
    try {
      await rerender()
      const token = await dependencies.getToken()
      if (disposed) return
      if (!token) throw new Error('Sign in to LVCE with GitHub before creating a pull request.')
      if (!previousNumber) {
        const result = await dependencies.request(token, '', { base: base.trim(), description, head: head.trim(), repository, title: title.trim() })
        if (!Number.isSafeInteger(result.number) || result.number < 1 || result.url !== `https://github.com/${repository}/pull/${result.number}`) {
          throw new Error('Invalid pull request response. Check GitHub before retrying.')
        }
        await update({ number: result.number, url: result.url })
      }
      if (disposed) return
      const { number } = state
      const result = await dependencies.request(token, '/auto-merge', { number, repository })
      if (result.autoMerge !== true) throw new Error('GitHub did not confirm auto-squash.')
      await update({ autoMerge: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const { number } = state
      await update({ error: number ? `Pull request created, but auto-squash failed: ${message}` : message })
    } finally {
      await update({ busy: false })
    }
  }
  return {
    canCancel(): boolean {
      const { busy } = state
      return !busy
    },
    dispose(): void {
      disposed = true
    },
    initialize,
    input(name: unknown, value: unknown): void {
      const { busy, loading, number } = state
      if (disposed || busy || loading || number || typeof value !== 'string') return
      if (typeof name === 'string' && ['base', 'head', 'title', 'description'].includes(name)) state = { ...state, error: '', [name]: value }
    },
    render: (): readonly VirtualDomNode[] => renderCreatePullRequest(state),
    submit,
  }
}
