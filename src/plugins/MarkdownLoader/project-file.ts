import path from 'path'

import { rewriteFrontMatter, parseMarkdown } from '../../utils/markdown-parser'
import Project from '../../types/Project'
import logger from '../../utils/logger'

export const actualizeProject = async (project: Project) => {
  const readmeFilepath = path.join(project.path, `README.md`)

  try {
    const { id, name, links, alias, rank } = await parseMarkdown(readmeFilepath)

    project.setId(id)
    project.setRank(rank)
    project.setName(name)
    project.addLinks(links)
    project.setAlias(alias)
    // project.keyworkds = keywords
    project.configFilepaths.push(readmeFilepath)
  } catch (error) {
    logger.info(`no readme for ${project.path}`, { error })
  }
}

export const parseProject = async (
  filePath: string
): Promise<Project | undefined> => {
  try {
    const project = new Project()

    project.setPath(path.dirname(filePath))
    project.setName(path.basename(project.path))

    await actualizeProject(project)

    return project
  } catch (error) {
    // When a request is aborted - err is an AbortError
    logger.info(`impossible to parse project ${filePath}`, { error })
  }
  return undefined
}

export const isGenerationRequired = (project: Project | undefined): boolean =>
  project?.id === 'generate'

export const isValid = (project: Project | undefined): boolean =>
  Boolean(project?.id) && !isGenerationRequired(project)

export const addRandomIdToProject = async (project: Project) => {
  const newId = project?.generateRandomId() || ''
  await rewriteFrontMatter(newId, project.configFilepaths[0])
}
