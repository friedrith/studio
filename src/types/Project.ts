import Link from './Link'

export default class Project {
  id: string = ''

  name: string = ''

  alias: string = ''

  keyworkds: Array<string> = []

  path: string = ''

  links: Array<Link> = []

  stared: boolean = false

  projects: Array<Project> = []

  setId(id: string | undefined) {
    this.id = id || this.id
  }

  setName(name: string | undefined) {
    this.name = name || this.name
  }

  setPath(path: string) {
    this.path = path
  }

  setAlias(alias: string | undefined) {
    if (alias) {
      this.alias = alias
    }
  }

  addLinks(links: Array<Link> | undefined) {
    if (links) {
      this.links = [...links, ...this.links]
    }
  }

  configFilepaths: Array<string> = []
}
