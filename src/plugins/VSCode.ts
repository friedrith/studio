import { Notification, clipboard } from 'electron'
import fs from 'fs/promises'
import path from 'path'

// import PluginOptions from '../types/PluginOptions'
import Link from '../types/Link'
import Plugin from '../types/Plugin'
import PluginOptions from '../types/PluginOptions'
// import Project from '../models/Project'

export default class VSCode extends Plugin {
  constructor() {
    super('studio.vscode')
    this.scopes = ['shortcuts', 'links']
  }

  // eslint-disable-next-line class-methods-use-this
  async createShortcut(pluginOptions: PluginOptions): Promise<any> {
    const { activeProject } = pluginOptions

    const enabled = !activeProject?.links.some((link) =>
      link.label.includes('VS Code')
    )

    return {
      label: 'Create VS Code Workspace',
      enabled,
      click: async () => {
        const templateFilename = path.join(
          __dirname,
          '../../templates/project.code-workspace'
        )
        const template = await fs.readFile(templateFilename, {
          encoding: 'utf8',
        })

        const workspaceName = (
          activeProject?.alias ||
          activeProject?.name ||
          ''
        )
          .replace(/(\s|\/)/, '-')
          .toLowerCase()

        const workspaceFilename = path.join(
          activeProject?.path || '',
          `${workspaceName}.code-workspace`
        )

        await fs.writeFile(workspaceFilename, template)

        clipboard.writeText(`[VS Code](vscode://file${workspaceFilename})`)
        new Notification({
          title: 'New workspace generated',
          body: 'A new VS Code has been generated and the link to open VS Code copied in clipboad',
        }).show()
      },
    }
  }

  // eslint-disable-next-line class-methods-use-this
  transformLinks(links: Array<Link>): Array<Link> {
    return [
      {
        label: 'VS Code',
        stared: true,
      },
      ...links,
    ]
  }
}
