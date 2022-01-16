/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import EventEmitter from 'events'

import { generateFilename, getJsonFile, saveJsonFile } from '../utils/json-file'

import Link from './Link'
import PluginOptions from './PluginOptions'

export default class Plugin extends EventEmitter {
  id: string = ''

  configFilename: string = ''

  scopes: Array<string> = []

  constructor(id: string) {
    super()
    this.id = id
    this.configFilename = generateFilename(this.id)

    this.scopes = []
  }

  async createShortcut(_pluginOptions: PluginOptions) {
    return { label: null }
  }

  // eslint-disable-next-line
  async getData(pluginOptions: PluginOptions): Promise<PluginOptions> {
    return { ...pluginOptions }
  }

  // eslint-disable-next-line class-methods-use-this
  async init(): Promise<void> {}

  async getPluginConfig(defaultConfig) {
    return getJsonFile(this.configFilename, defaultConfig)
  }

  async savePluginConfig(newConfig) {
    saveJsonFile(this.configFilename, newConfig)
  }

  static onlyScope(scope: string) {
    return (plugin: Plugin) => plugin.scopes.includes(scope)
  }

  // eslint-disable-next-line class-methods-use-this
  transformLinks(links: Array<Link>): Array<Link> {
    return links
  }

  // static transformLinks(plugins: Array<Plugin>, links: Array<Link>) {
  //   return plugins
  //     .filter(Plugin.onlyScope('links'))
  //     .reduce(
  //       (acc: Array<Link>, plugin: Plugin) => plugin.transformLinks(acc),
  //       links
  //     )
  // }
}
