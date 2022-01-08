import EventEmitter from 'events'
import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

import Project from './Project'
import Link from './Link'

export interface PluginOptions {
  activeProject: Project | undefined
  projects: Array<Project>
}

export default class Plugin extends EventEmitter {
  id: string = ''

  configFilename: string = ''

  scopes: Array<string> = []

  constructor(id: string) {
    super()
    this.id = id
    this.configFilename = path.join(
      app.getPath('home'),
      `.studio/${this.id}.json`
    )

    this.scopes = []
  }

  // eslint-disable-next-line
  async createMenu(_options: PluginOptions, _config: any) {
    return {}
  }

  // eslint-disable-next-line
  async getData(data: any): Promise<PluginOptions> {
    return { ...data }
  }

  // eslint-disable-next-line class-methods-use-this
  async init(): Promise<void> {}

  async getPluginConfig(defaultConfig) {
    return fs
      .readFile(this.configFilename, { encoding: 'utf8' })
      .then(JSON.parse)
      .catch(() => defaultConfig)
  }

  async savePluginConfig(newConfig) {
    fs.writeFile(this.configFilename, JSON.stringify(newConfig, null, `\t`))
  }

  static onlyScope(scope: string) {
    return (plugin: Plugin) => plugin.scopes.includes(scope)
  }

  // eslint-disable-next-line class-methods-use-this
  transformLink(link: Link): Link {
    return link
  }

  static transformLink(plugins: Array<Plugin>) {
    return (link: Link) =>
      plugins
        .filter(Plugin.onlyScope('link'))
        .reduce((acc: Link, plugin: Plugin) => plugin.transformLink(acc), link)
  }
}
