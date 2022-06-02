import GlobalSettings from './GlobalSettings'
import Project from './Project'

export default interface GlobalContext extends GlobalSettings {
  activeProject: Project | undefined
  projects: Array<Project>
  plugins: { [id: string]: any }
}
