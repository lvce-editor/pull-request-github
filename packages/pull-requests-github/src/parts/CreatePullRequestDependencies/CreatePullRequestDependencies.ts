import { executeCommand, getAccessToken } from '@lvce-editor/api'
import * as GitHubWorkerRpc from '../GitHubWorkerRpc/GitHubWorkerRpc.ts'
import { parseGitHubRemoteUrl } from '../GitRemote/GitRemote.ts'

export interface Defaults {
  readonly baseBranch: string
  readonly headBranch: string
  readonly remoteUrl: string
  readonly title: string
}
export interface Dependencies {
  readonly getDefaults: () => Promise<Defaults>
  readonly getToken: () => Promise<string>
  readonly request: (token: string, path: string, body?: unknown) => Promise<any>
}
interface Fixture {
  readonly defaults?: Defaults
  readonly error?: string
  readonly responses: readonly unknown[]
  readonly signedOut?: boolean
}
const mockState: { fixture: Fixture | undefined } = { fixture: undefined }
export const setCreationFixture = async (value: Fixture | undefined): Promise<void> => {
  mockState.fixture = value
  await GitHubWorkerRpc.setCreateResponses(value?.responses)
}
export const dependencies: Dependencies = {
  async getDefaults(): Promise<Defaults> {
    const { fixture } = mockState
    if (fixture) {
      if (fixture.error) throw new Error(fixture.error)
      if (fixture.defaults) return fixture.defaults
      throw new Error('No repository configured')
    }
    return (await executeCommand('git.getPullRequestDefaults')) as Defaults
  },
  async getToken(): Promise<string> {
    const { fixture } = mockState
    if (fixture) return fixture.signedOut ? '' : 'mock-lvce-token'
    return (await getAccessToken({ refresh: 'if-needed' })) || ''
  },
  request: GitHubWorkerRpc.createRequest,
}
export const getRepository = (remote: string): string => {
  const repository = parseGitHubRemoteUrl(remote)
  if (!repository) throw new Error('The current Git remote is not hosted on GitHub.')
  return `${repository.owner}/${repository.name}`
}
