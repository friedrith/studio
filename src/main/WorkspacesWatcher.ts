import path from 'path'
import EventEmitter from 'events'
import chokidar from 'chokidar'

import Project from '../models/Project'
import logger from '../utils/logger'

import { parseMarkdown } from './utils/parsers'

// npx ts-node src/main/projects-watcher.ts

const updateWithReadme = async (project: Project) => {
  const readmeFilepath = path.join(project.path, `README.md`)

  try {
    const { id, name, links, alias } = await parseMarkdown(readmeFilepath)

    project.setId(id)
    project.setName(name)
    project.addLinks(links)
    project.setAlias(alias)
    // project.keyworkds = keywords
    project.configFilepaths.push(readmeFilepath)
  } catch (error) {
    // logger.info(`no readme for ${project.path}`, { error })
  }
}

// const updateWithTeamConfig = async (project: Project) => {
//   const teamConfigFilepath = path.join(project.path, `.studio.yml`)

//   try {
//     const teamConfig = await parseYaml(teamConfigFilepath)
//     const { id, name, alias, links = [] } = teamConfig

//     project.setId(id)
//     project.setName(name)
//     project.addLinks(links)
//     project.setAlias(alias)
//     project.configFilepaths.push(teamConfigFilepath)
//   } catch (error) {
//     // logger.info(`no team config for ${project.path}`, { error })
//   }
// }

// const updateWithPersonalConfig = async (project: Project) => {
//   const configFilepath = path.join(project.path, `.studio.p.yml`)

//   try {
//     const config = await parseYaml(configFilepath)
//     const { name, alias, links = [] } = config
//     project.setName(name)
//     project.addLinks(links)
//     project.setAlias(alias)
//     project.configFilepaths.push(configFilepath)
//   } catch (error) {
//     // logger.info(`no personal config for ${project.path}`, { error })
//   }
// }

const parseProject = async (filePath: string): Promise<Project | null> => {
  try {
    const project = new Project()

    project.setPath(path.dirname(filePath))
    project.setName(path.basename(project.path))
    project.setId(project.path)

    await updateWithReadme(project)
    // await updateWithTeamConfig(project)
    // await updateWithPersonalConfig(project)

    return project
  } catch (err) {
    // When a request is aborted - err is an AbortError
    // console.error(filePath, err)
  }
  return null
}

// const parseWorkspaces = async () => {}

// parseWorkspaces()

export default class WorkspacesWatcher extends EventEmitter {
  projects: Array<Project> = []

  watcher

  findProject(filePath): Project | undefined {
    return this.projects.find((p: Project) =>
      p.configFilepaths.includes(filePath)
    )
  }

  async init(config) {
    const { workspaces } = config

    const workspacePatterns = workspaces.map((w: string) => `${w}/**/README.md`)

    this.watcher = chokidar.watch(workspacePatterns, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
    })

    this.watcher
      .on('add', async (filePath: string) => {
        if (
          !workspacePatterns.includes(filePath) &&
          !this.findProject(filePath)
        ) {
          const project = await parseProject(filePath)
          // console.log('project', project)
          if (project !== null && project?.id) {
            this.projects.push(project)

            // this.watcher.add(
            //   project.configFilepaths.filter(
            //     (configFilepath: string) => configFilepath !== filePath
            //   )
            // )
            this.emit('change', filePath)
          }
        }
      })
      .on('change', async (filePath: string) => {
        logger.info(`File ${filePath} has been changed`)

        if (!workspacePatterns.includes(filePath)) {
          const project = this.findProject(filePath)

          if (project) {
            project.links = []
            await updateWithReadme(project)
            // await updateWithTeamConfig(project)
            // await updateWithPersonalConfig(project)
            this.emit('change', filePath)
          }
        }

        this.emit('change', filePath)
      })
      .on('unlink', (filePath) =>
        logger.info(`File ${filePath} has been removed`)
      )
  }
}
