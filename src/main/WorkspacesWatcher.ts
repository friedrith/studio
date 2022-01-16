import path from 'path'
import EventEmitter from 'events'
import chokidar from 'chokidar'

import Project from '../types/Project'
import logger from '../utils/logger'

import { rewriteFrontMatter, parseMarkdown } from './utils/markdown-parser'

// npx ts-node src/main/projects-watcher.ts

const projectReadme = (project: Project) => path.join(project.path, `README.md`)

const updateWithReadme = async (project: Project) => {
  const readmeFilepath = projectReadme(project)

  try {
    const { id, name, links, alias } = await parseMarkdown(readmeFilepath)

    project.setId(id)
    project.setName(name)
    project.addLinks(links)
    project.setAlias(alias)
    // project.keyworkds = keywords
    project.configFilepaths.push(readmeFilepath)
  } catch (error) {
    logger.info(`no readme for ${project.path}`, { error })
  }
}

const parseProject = async (filePath: string): Promise<Project | undefined> => {
  try {
    const project = new Project()

    project.setPath(path.dirname(filePath))
    // project.setName(path.basename(project.path))
    // project.setId(project.path)

    await updateWithReadme(project)

    return project
  } catch (error) {
    // When a request is aborted - err is an AbortError
    logger.info(`impossible to parse project ${filePath}`, { error })
  }
  return undefined
}

const isGenerationRequired = (project: Project | undefined): boolean =>
  project?.id === 'generate'

const isInvalid = (project: Project | undefined): boolean =>
  project == null || !project?.id

export default class WorkspacesWatcher extends EventEmitter {
  projects: Array<Project> = []

  watcher

  // eslint-disable-next-line class-methods-use-this
  isProject(project: Project, filePath: string): boolean {
    return project.configFilepaths.includes(filePath)
  }

  findProject(filePath): Project | undefined {
    const dirname = path.dirname(filePath)

    return this.projects.find((p) => p.path === dirname)
  }

  removeProject(project: string | Project) {
    const dirname =
      typeof project === 'string' ? path.dirname(project) : project?.path || ''
    this.projects = this.projects.filter((p) => p.path !== dirname)
    this.emit('change', dirname)
  }

  addProject(filePath, project) {
    this.projects.push(project)
    this.emit('change', filePath)
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
        if (this.findProject(filePath)) {
          return
        }
        const project = await parseProject(filePath)
        if (isInvalid(project)) {
          return
        }
        if (isGenerationRequired(project)) {
          await rewriteFrontMatter(filePath)
        } else {
          this.addProject(filePath, project)
        }
      })
      .on('change', async (filePath: string) => {
        logger.info(`File ${filePath} has been changed`)

        const project = await parseProject(filePath)

        const existingProject = this.findProject(filePath)

        if (isInvalid(project)) {
          if (existingProject) {
            this.removeProject(existingProject)
          }
        } else if (isGenerationRequired(project)) {
          await rewriteFrontMatter(filePath)
          if (existingProject) {
            this.removeProject(existingProject)
          }
        } else if (existingProject) {
          existingProject.id = ''
          existingProject.links = []
          await updateWithReadme(existingProject)
          this.emit('change', filePath)
        } else {
          this.addProject(filePath, project)
        }

        // if (existingProject) {
        // }

        // if (existingProject) {
        //   console.log('project registered')
        //   existingProject.id = ''
        //   existingProject.links = []
        //   await updateWithReadme(existingProject)

        //   if (!existingProject?.id || existingProject?.id === 'random') {
        //     console.log('remove project')
        //     this.projects = this.projects.filter(
        //       (p) => !this.isProject(p, filePath)
        //     )

        //     if (existingProject?.id === 'random') {
        //       console.log('rewrite', filePath)
        //       await rewriteFrontMatter(filePath)
        //     }
        //   }
        //   this.emit('change', filePath)

        //   // await updateWithTeamConfig(project)
        //   // await updateWithPersonalConfig(project)
        // } else {
        //   console.log('project not registered')

        //   const project = await parseProject(filePath)
        //   if (project !== null && project?.id !== 'random') {
        //     this.projects.push(project)

        //     // this.watcher.add(
        //     //   project.configFilepaths.filter(
        //     //     (configFilepath: string) => configFilepath !== filePath
        //     //   )
        //     // )
        //     this.emit('change', filePath)
        //   } else {
        //     console.log('rewrite', filePath)
        //     await rewriteFrontMatter(filePath)
        //   }
        // }

        // this.emit('change', filePath)
      })
      .on('unlink', (filePath: string) => {
        logger.info(`File ${filePath} has been removed`)

        this.removeProject(filePath)
      })
  }
}
