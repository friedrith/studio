/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import EventEmitter from 'events'

import { generateFilename, getJsonFile, saveJsonFile } from '../utils/json-file'
import { getSettings } from '../main/utils/settings'

import Link from './Link'
import PluginOptions from './PluginOptions'

export default class Plugin extends EventEmitter {
  id: string = ''

  databaseFilename: string = ''

  scopes: Array<string> = []

  constructor(id: string) {
    super()
    this.id = id
    this.databaseFilename = generateFilename(this.id)

    this.scopes = []
  }

  async reload() {}

  async createShortcut(_pluginOptions: PluginOptions) {
    return { label: null }
  }

  // eslint-disable-next-line
  async getData(pluginOptions: PluginOptions): Promise<PluginOptions> {
    return { ...pluginOptions }
  }

  // eslint-disable-next-line class-methods-use-this
  async init(): Promise<void> {}

  async getPluginDataBase(defaultDatabase) {
    return getJsonFile(this.databaseFilename, defaultDatabase)
  }

  async getPluginSettings(defaultSettings) {
    return getSettings(defaultSettings)
  }

  async savePluginDatabase(newDatabase) {
    saveJsonFile(this.databaseFilename, newDatabase)
  }

  static onlyScope(scope: string) {
    return (plugin: Plugin) => plugin.scopes.includes(scope)
  }

  // eslint-disable-next-line class-methods-use-this
  transformLinks(
    links: Array<Link>,
    _pluginOptions: PluginOptions
  ): Promise<Array<Link>> {
    return Promise.resolve(links)
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
