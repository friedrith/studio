import path from 'path'
import Project from '../../types/Project'

const findParenthood = (project: Project, projects: Array<Project>) => {
  const parentProject = projects.find(
    (p) => p.path === path.dirname(project.path)
  )

  if (parentProject) {
    project.parent = parentProject
    parentProject.children.push(project)
  }
}

export default findParenthood
