import Workspace from './Workspace'

interface Settings {
  menuTitle: string
  subTitle: string
  workspaces: Array<Workspace>
  showRefresh: boolean
  editor: string
  staredActions: Array<string>
  pluginsEnabled: Array<string>
}

export default Settings
