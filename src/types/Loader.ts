import Plugin from './Plugin'
import Project from './Project'
import Settings from './Settings'

export default class Loader extends Plugin {
  constructor(id: string) {
    super(id)
    this.scopes = ['loader', 'editor']
  }

  // eslint-disable-next-line class-methods-use-this
  async init(_: Settings) {}

  // eslint-disable-next-line class-methods-use-this
  getProjects(): Project[] {
    return []
  }
}
