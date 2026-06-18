import * as WrapCommand from '../ExplorerStates/ExplorerStates.ts'
import * as UpdateIcons from '../UpdateIcons/UpdateIcons.ts'

export const commandMap = {
  'Explorer.updateIcons': WrapCommand.wrapListItemCommand(UpdateIcons.updateIcons),
}
