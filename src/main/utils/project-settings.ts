import EventEmitter from 'events'
import { app } from 'electron'
import path from 'path'

import {
  generateFilename,
  getJsonFile,
  saveJsonFile,
} from '../../utils/json-file'

// TODO: is it used?
class ProjectSettings extends EventEmitter {
  watches: any

  filename: string

  constructor() {
    super()

    this.filename = generateFilename('project-settings')
  }

  async get(projectId) {
    return getJsonFile(this.filename, { [projectId]: {} })[projectId] || {}
  }

  async save(projectId: string, data) {
    const settings = getJsonFile(this.filename, {})

    await saveJsonFile(this.filename, { ...settings, [projectId]: data })
  }

  async createTemporarySettingsFile(projectId: string) {
    const settings = await this.get(projectId)

    const tempFilename = path.join(app.getPath('temp'), 'project.json')

    await saveJsonFile(tempFilename, settings)

    return tempFilename
  }
}

export default new ProjectSettings()
