// import { Duration, DateTime } from 'luxon'

// import ejs from 'ejs'
import Plugin from '../types/Plugin'
import Project from '../types/Project'
// import PluginOptions from '../types/PluginOptions'

// interface GenericTimeTrackerOptions extends PluginOptions {
//   isTracking: boolean
//   currentTracking?: (format: string) => string
//   dayProjectTracking?: (format: string) => string
//   weekProjectTracking?: (format: string) => string
//   dayTracking?: (format: string) => string
//   weekTracking?: (format: string) => string
// }

interface Entry {
  id: string
  start: string
  end: string
  projectId: string
}

export default class GenericTimeTracker extends Plugin {
  db: Array<Entry> = []

  startDate: Date | null = null

  startDateProject: Project | undefined = undefined

  config: Array<any> = []

  constructor(id: string, scopes: Array<string>) {
    super(id)
    this.scopes = ['shortcuts', 'data', ...scopes]
  }

  async init() {
    this.db = await this.getPluginDataBase([])
  }
}
