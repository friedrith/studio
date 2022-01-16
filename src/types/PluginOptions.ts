import Project from './Project'
import Settings from './Settings'

interface PluginOptions extends Settings {
  activeProject: Project | undefined;
  projects: Array<Project>;
}

export default PluginOptions
