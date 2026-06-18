import { activate as activateExtensionApi, registerView } from '@lvce-editor/api'
import * as PullRequestCommands from '../PullRequestCommands/PullRequestCommands.ts'
import * as PullRequestView from '../PullRequestView/PullRequestView.ts'

export const listen = async (): Promise<void> => {
  void activateExtensionApi()
  PullRequestCommands.registerCommands()
  registerView({
    create: PullRequestView.create,
    icon: 'symbol-github',
    id: 'github.pullRequests',
    kind: 'virtualDom',
    title: 'Pull Requests',
  } as any)
}
