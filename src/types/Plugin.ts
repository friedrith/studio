/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import EventEmitter from 'events'

import { generateFilename, getJsonFile, saveJsonFile } from '../utils/json-file'
import { getSettings } from '../main/utils/settings'

import Link from './Link'
import Shortcut from './Shortcut'
import PluginOptions from './PluginOptions'
import Settings from './Settings'
import Project from './Project'

export default class Plugin extends EventEmitter {
  id: string = ''

  databaseFilename: string = ''

  scopes: Array<string> = []

  constructor(id: string) {
    super()
    this.id = id
    this.databaseFilename = generateFilename(`${this.id}.db`)

    this.scopes = []
  }

  async reload() {}

  emitReloadUi() {
    this.emit('reload-tray')
  }

  async createShortcut(_pluginOptions: PluginOptions): Promise<Shortcut> {
    return { label: '' }
  }

  getContext(_: PluginOptions): any {
    return {}
  }

  // eslint-disable-next-line class-methods-use-this
  async init(_: Settings): Promise<void> {}

  async getPluginDataBase(defaultDatabase) {
    return getJsonFile(this.databaseFilename, defaultDatabase)
  }

  async getSettings() {
    return getSettings()
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

  getProjects(): Array<Project> {
    return []
  }
}
