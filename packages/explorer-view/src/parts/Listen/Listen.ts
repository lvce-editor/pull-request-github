import { activate as activateExtensionApi, registerView } from '@lvce-editor/api'
import * as PullRequestView from '../PullRequestView/PullRequestView.ts'

export const listen = async (): Promise<void> => {
  void activateExtensionApi()
  registerView({
    create: PullRequestView.create,
    icon: 'symbol-github',
    id: 'github.pullRequests',
    kind: 'virtualDom',
    title: 'Pull Requests',
  } as any)
}
