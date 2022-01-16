import fs from 'fs/promises'
import path from 'path'

import Link from '../types/Link'
import Plugin from '../types/Plugin'
import PluginOptions from '../types/PluginOptions'
import Project from '../types/Project'

export default class VSCode extends Plugin {
  config: any

  constructor() {
    super('studio.vscode')
    this.scopes = ['shortcuts', 'links']
  }

  async init() {
    this.config = await this.getPluginConfig({ workspaceByProjectId: {} })
  }

  async generateWorkspace(project: Project) {
    const templateFilename = path.join(
      __dirname,
      '../../templates/project.code-workspace'
    )
    const template = await fs.readFile(templateFilename, {
      encoding: 'utf8',
    })

    const workspaceName = (project?.alias || project?.name || '')
      .replace(/(\s|\/)/, '-')
      .toLowerCase()

    const workspaceFilename = path.join(
      project?.path || '',
      `${workspaceName}.code-workspace`
    )

    await fs.writeFile(workspaceFilename, template)

    this.config.workspaceByProjectId[project.id] = workspaceFilename

    this.savePluginConfig(this.config)

    this.emit('change-tray')
  }

  // eslint-disable-next-line class-methods-use-this
  async createShortcut(pluginOptions: PluginOptions): Promise<any> {
    const { activeProject } = pluginOptions

    if (!activeProject) {
      return { label: null }
    }

    return {
      label: 'Create VS Code Workspace',
      enabled: !this.config?.workspaceByProjectId[activeProject?.id],
      click: async () => {
        await this.generateWorkspace(activeProject)
      },
    }
  }

  // eslint-disable-next-line class-methods-use-this
  transformLinks(
    links: Array<Link>,
    pluginOptions: PluginOptions
  ): Array<Link> {
    const { activeProject } = pluginOptions

    if (!activeProject) {
      return links
    }

    const workspace = this.config?.workspaceByProjectId[activeProject?.id]

    if (workspace) {
      return [
        {
          label: 'VS Code',
          stared: true,
          href: `vscode://file${workspace}`,
        },
        ...links,
      ]
    }

    return links
  }
}
