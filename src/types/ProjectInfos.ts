import Link from './Link'
import ProjectRank from './ProjectRank'

export default interface ProjectInfos {
  id?: string
  name?: string
  alias?: string
  keyworkds?: Array<string>
  path?: string
  links?: Array<Link>
  stared?: boolean
  color?: string
  studio?: boolean
  date?: string
  rank?: ProjectRank
}
