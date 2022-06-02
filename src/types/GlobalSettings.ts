import Workspace from './Workspace'

interface GlobalSettings {
  menuTitle: string
  subTitle: string
  workspaces: Array<Workspace>
  showRefresh: boolean
  editor: string
  staredShortcuts: Array<string>
  pluginsEnabled: Array<string>
}

export default GlobalSettings
