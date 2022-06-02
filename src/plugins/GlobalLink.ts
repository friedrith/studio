import { shell } from 'electron'

import Plugin from '../types/Plugin'
import Shortcut from '../types/Shortcut'
import PluginOptions from '../types/PluginOptions'

export default class GlobalLink extends Plugin {
  database: any

  constructor() {
    super('studio.global-link')
    this.scopes = ['shortcuts']
  }

  // eslint-disable-next-line class-methods-use-this
  async createShortcut(pluginOptions: PluginOptions): Promise<Shortcut> {
    if (!pluginOptions.plugin?.label || !pluginOptions.plugin?.link) {
      return { label: '' }
    }

    return {
      label: pluginOptions.plugin?.label,
      enabled: true,
      click: async () => {
        shell.openExternal(pluginOptions.plugin?.link)
      },
      oneShot: false,
    }
  }
}
