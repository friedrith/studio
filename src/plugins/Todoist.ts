import { Todoist as Todoistv8 } from 'todoist'
import { shell } from 'electron'

import GenericTaskManager from '../types/GenericTaskManager'
import PluginOptions from '../types/PluginOptions'
import Project from '../types/Project'
import Link from '../types/Link'

const hasTodoistLink = (project: Project) =>
  (project.links || []).some((l: Link) =>
    l.href?.startsWith('https://todoist.com/')
  )

const ID = 'studio.todoist'

export default class Todoist extends GenericTaskManager {
  todoist: any

  constructor() {
    super(ID)
  }

  async init(settings: any) {
    // console.log('token', settings.plugins[ID])
    this.todoist = Todoistv8(settings.plugins[ID].token)
    await this.todoist.sync()
  }

  // eslint-disable-next-line class-methods-use-this
  async createShortcut(pluginOptions: PluginOptions): Promise<any> {
    const { activeProject } = pluginOptions

    if (!activeProject) {
      return { label: '' }
    }

    return {
      label: 'Create Todoist Project',
      enabled: !hasTodoistLink(activeProject),
      click: async () => {
        // https://developer.todoist.com/sync/v8/#add-a-project
        const project = await this.todoist.projects.add({
          name: activeProject.name,
        })

        const href = `https://todoist.com/app/project/${project.id}`

        const link = {
          label: 'Task',
          href,
          stared: true,
        }

        await shell.openExternal(link.href)

        console.log('link', link)

        this.askToAddTaskManagerProjectToProjectPage(link)
      },
    }
  }
}
