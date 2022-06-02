import Project from './Project'
import GlobalSettings from './GlobalSettings'

interface PluginOptions extends GlobalSettings {
  activeProject: Project | undefined
  projects: Array<Project>
  plugin: any
}

export default PluginOptions

export type PluginOptionsMap = { [id: string]: PluginOptions }
