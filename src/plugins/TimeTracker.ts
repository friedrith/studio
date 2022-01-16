import { Duration, DateTime } from 'luxon'

import ejs from 'ejs'
import Plugin from '../types/Plugin'
import Project from '../types/Project'
import PluginOptions from '../types/PluginOptions'

interface TimeTrackerOptions extends PluginOptions {
  isTracking: boolean
  currentTracking: (format: string) => string
  dayProjectTracking: (format: string) => string
  weekProjectTracking: (format: string) => string
  dayTracking: (format: string) => string
  weekTracking: (format: string) => string
}

const formatDuration = (duration: number, format: string) => {
  return Duration.fromMillis(duration).toFormat(format)
}

export default class TimeTracker extends Plugin {
  interval: any

  chrono: number = 0

  startDate: Date | null = null

  startDateProject: Project | undefined = undefined

  config: Array<any> = []

  activeProject: Project | undefined = undefined

  constructor() {
    super('studio.time-tracker')
    this.chrono = 0
    this.scopes = ['shortcuts', 'data']
  }

  async init() {
    this.config = await this.getPluginConfig([])

    const lastEntry =
      this.config.length > 0
        ? this.config[this.config.length - 1]
        : { endDate: 'foo' }

    if (!lastEntry.endDate) {
      this.startDate = lastEntry.startDate
      this.start()
    }
  }

  start() {
    this.interval = setInterval(() => {
      this.chrono += 1
      this.emit('change-tray')
    }, 1000)
  }

  async stop() {
    clearInterval(this.interval)
    this.config = this.config.map((line) =>
      line.startDate === this.startDate
        ? { ...line, endDate: DateTime.now().toISO({ includeOffset: false }) }
        : line
    )
    await this.savePluginConfig(this.config)

    this.startDate = null
  }

  isActiveProject(l) {
    return l.projectId === this.activeProject?.id
  }

  // eslint-disable-next-line class-methods-use-this
  isRightDay(l) {
    const startDate = DateTime.fromISO(l.startDate)
    const now = DateTime.now()

    return (
      startDate.day === now.day &&
      startDate.month === now.month &&
      startDate.year === now.year
    )
  }

  // eslint-disable-next-line class-methods-use-this
  isRightWeek(l) {
    const startDate = DateTime.fromISO(l.startDate)
    const now = DateTime.now()

    return (
      startDate.weekNumber === now.weekNumber && startDate.year === now.year
    )
  }

  getCurrentDuration() {
    return this.startDate
      ? DateTime.now().diff(DateTime.fromISO(this.startDate)).toMillis()
      : 0
  }

  currentTracking(format: string) {
    return this.startDate
      ? formatDuration(this.getCurrentDuration(), format)
      : ''
  }

  dayProjectTracking(format: string) {
    let duration = this.getCurrentDuration()

    this.config
      .filter((l) => l.endDate)
      .filter((l) => this.isRightDay(l))
      .filter((l) => this.isActiveProject(l))
      .forEach((l) => {
        duration += DateTime.fromISO(l.endDate)
          .diff(DateTime.fromISO(l.startDate))
          .toMillis()
      })

    return formatDuration(duration, format)
  }

  weekProjectTracking(format: string) {
    let duration = this.getCurrentDuration()

    this.config
      .filter((l) => l.endDate)
      .filter((l) => this.isRightWeek(l))
      .filter((l) => this.isActiveProject(l))
      .forEach((l) => {
        duration += DateTime.fromISO(l.endDate)
          .diff(DateTime.fromISO(l.startDate))
          .toMillis()
      })

    return formatDuration(duration, format)
  }

  dayTracking(format: string) {
    let duration = this.getCurrentDuration()

    this.config
      .filter((l) => l.endDate)
      .filter((l) => this.isRightDay(l))
      .forEach((l) => {
        duration += DateTime.fromISO(l.endDate)
          .diff(DateTime.fromISO(l.startDate))
          .toMillis()
      })

    return formatDuration(duration, format)
  }

  weekTracking(format: string) {
    let duration = this.getCurrentDuration()

    this.config
      .filter((l) => l.endDate)
      .filter((l) => this.isRightWeek(l))
      .forEach((l) => {
        duration += DateTime.fromISO(l.endDate)
          .diff(DateTime.fromISO(l.startDate))
          .toMillis()
      })

    return formatDuration(duration, format)
  }

  async setActiveProject(activeProject: Project | undefined) {
    if (activeProject?.id !== this.activeProject?.id) {
      if (this.startDate) {
        await this.stop()
      }
      this.activeProject = activeProject
    }
  }

  async createShortcut(pluginOptions: PluginOptions) {
    const { activeProject } = pluginOptions

    await this.setActiveProject(activeProject)

    return {
      label: ejs.render(
        `${this.startDate ? 'Stop timer' : 'Start timer'} ${
          pluginOptions['studio.time-tracker.toggleLabel']
        }`,
        pluginOptions
      ),
      click: async () => {
        this.emit('change-tray')
        if (!this.startDate) {
          this.chrono = 0
          this.startDate = DateTime.now().toISO({ includeOffset: false })
          this.startDateProject = activeProject
          this.start()
          this.config.push({
            startDate: this.startDate,
            projectId: activeProject?.id,
            projectName: activeProject?.name,
          })
          await this.savePluginConfig(this.config)
        } else {
          await this.stop()
        }
      },
    }
  }

  async getData(data: PluginOptions): Promise<TimeTrackerOptions> {
    await this.setActiveProject(data.activeProject)

    return {
      ...data,
      isTracking: Boolean(this.startDate),
      currentTracking: (format: string) => this.currentTracking(format),
      dayProjectTracking: (format: string) => this.dayProjectTracking(format),
      weekProjectTracking: (format: string) => this.weekProjectTracking(format),
      dayTracking: (format: string) => this.dayTracking(format),
      weekTracking: (format: string) => this.weekTracking(format),
    }
  }
}
