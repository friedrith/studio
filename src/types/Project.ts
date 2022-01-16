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
    console.log('setRank', this.name, rank)
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

  configFilepaths: Array<string> = []
}
