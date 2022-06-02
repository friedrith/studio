import path from 'path'
import util from 'util'
import { realpath } from 'fs/promises'
import child_process from 'child_process'
import Link from '../types/Link'
import Plugin from '../types/Plugin'
import PluginOptions from '../types/PluginOptions'

import { generateFilename, getJsonFile } from '../utils/json-file'

const exec = util.promisify(child_process.exec)

interface Folder {
  path: string
}

export default class VSCode extends Plugin {
  database: any

  constructor() {
    super('studio.iterm')
    this.scopes = ['links']
  }

  // eslint-disable-next-line class-methods-use-this
  async transformLinks(
    links: Array<Link>,
    pluginOptions: PluginOptions
  ): Promise<Array<Link>> {
    const { activeProject } = pluginOptions

    if (!activeProject) {
      return Promise.resolve(links)
    }

    const filename = generateFilename('studio.vscode.db')
    const content = await await getJsonFile(filename, {})
    const workspaceFilename =
      content?.workspaceByProjectId[activeProject?.id] || ''

    if (!workspaceFilename) {
      return Promise.resolve(links)
    }

    const { folders } = await getJsonFile(workspaceFilename, { folders: [] })

    const realWorkspaceFilename = await realpath(
      path.dirname(workspaceFilename)
    )

    const terminals = folders
      .map((f: Folder) => path.resolve(realWorkspaceFilename, f.path))
      .map((dirname: string) => ({
        label: path.basename(dirname),
        click: async () => {
          try {
            await exec(`open -a iTerm "${dirname.replace(/\s/, '\\ ')}"`)
          } catch (error) {
            console.log('error', error)
          }
        },
      }))

    if (terminals.length === 0) {
      return links
    }
    if (terminals.length === 1) {
      return [
        {
          label: `Terminal ${terminals[0].label}`,
          stared: true,
          click: terminals[0].click,
        },
        ...links,
      ]
    }
    return [
      {
        label: 'Terminal',
        stared: true,
        submenu: terminals,
      },
      ...links,
    ]
  }
}
