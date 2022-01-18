import { v4 as uuidv4 } from 'uuid'

import Link from './Link'
import ProjectRank from './ProjectRank'

export default class Project {
  id: string = ''

  name: string = ''

  alias: string = ''

  keyworkds: Array<string> = []

  path: string = ''

  links: Array<Link> = []

  stared: boolean = false

  projects: Array<Project> = []

  rank: ProjectRank = ProjectRank.Common

  setId(id: string | undefined) {
    this.id = id || this.id
  }

  setName(name: string | undefined) {
    this.name = name || this.name
  }

  setPath(path: string) {
    this.path = path
  }

  setRank(rank: ProjectRank | undefined) {
    if (rank !== undefined && Object.values(ProjectRank).includes(rank)) {
      this.rank = rank
    } else {
      this.rank = ProjectRank.Common
    }
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

  generateRandomId(): string {
    return `${this.name.toLowerCase().replace(/\s/g, '-')}-${uuidv4()}`
  }

  configFilepaths: Array<string> = []
}
