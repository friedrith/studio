import Plugin from './Plugin'
import PluginOptions from './PluginOptions'
import Link from './Link'

export default class GenericTaskManager extends Plugin {
  constructor(id: string, scopes: Array<string> = []) {
    super(id)
    this.scopes = ['actions', 'editor', ...scopes]
  }

  askToAddTaskManagerProjectToProjectPage(link: Link) {
    this.emit('request-add-link', link)
  }

  // eslint-disable-next-line class-methods-use-this
  async createShortcut(pluginOptions: PluginOptions): Promise<any> {
    const { activeProject } = pluginOptions

    if (!activeProject) {
      return { label: null }
    }

    return {
      label: 'Create Task',
      enabled: true,
      click: async () => {},
    }
  }
}
