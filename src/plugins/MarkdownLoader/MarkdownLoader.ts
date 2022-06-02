import path from 'path'
import chokidar from 'chokidar'
import { FSWatcher, existsSync } from 'fs'

import Project from '../../types/Project'

import logger from '../../utils/logger'
import Loader from '../../types/Loader'
import Settings from '../../types/Settings'

import {
  actualizeProject,
  parseProject,
  isGenerationRequired,
  isValid,
  addRandomIdToProject,
} from './project-file'

import { onlyMarkdown, projectFileRegex } from './workspaces'
import findParenthood from './find-parenthood'

const ignoreDotfiles = /(^|[\/\\])\../

// npx ts-node src/main/projects-watcher.ts

export default class MarkdownLoader extends Loader {
  projects: Array<Project> = []

  watcher: FSWatcher | undefined

  constructor() {
    super('studio.markdown-loader')
  }

  // eslint-disable-next-line class-methods-use-this
  // isProject(project: Project, filePath: string): boolean {
  //   return project.configFilepaths.includes(filePath)
  // }

  findProject(filePath: string): Project | undefined {
    const dirname = path.dirname(filePath)

    return this.projects.find((p) => p.path === dirname)
  }

  removeProject(project: string | Project) {
    const dirname =
      typeof project === 'string' ? path.dirname(project) : project?.path || ''
    this.projects = this.projects.filter((p) => p.path !== dirname)
    this.emitReloadUi()
  }

  addProject(project: Project) {
    findParenthood(project, this.projects)
    this.projects.push(project)
    this.emitReloadUi()
  }

  async init(settings: Settings) {
    const { workspaces } = settings

    const workspacePatterns = workspaces
      .filter(onlyMarkdown)
      .map(projectFileRegex)

    this.watcher = chokidar.watch(workspacePatterns, {
      ignored: ignoreDotfiles,
      persistent: true,
    })

    this.watcher
      .on('add', async (filePath: string) => {
        if (this.findProject(filePath)) {
          return
        }
        const project = await parseProject(filePath)

        if (project === undefined) {
          return
        }

        if (isValid(project)) {
          this.addProject(project)
        } else if (isGenerationRequired(project)) {
          await addRandomIdToProject(project)
        }
      })
      .on('change', async (filePath: string) => {
        logger.info(`File ${filePath} has been changed`)

        const project = await parseProject(filePath)

        const existingProject = this.findProject(filePath)

        if (project !== undefined && isValid(project)) {
          if (existingProject) {
            existingProject.id = ''
            existingProject.links = []
            await actualizeProject(existingProject)
            this.emitReloadUi()
          } else {
            this.addProject(project)
          }
        } else {
          if (project !== undefined && isGenerationRequired(project)) {
            await addRandomIdToProject(project)
          }
          if (existingProject) {
            this.removeProject(existingProject)
          }
        }
      })
      .on('unlink', (filePath: string) => {
        logger.info(`File ${filePath} has been removed`)

        this.removeProject(filePath)
      })
      .on('unlinkDir', (dirPath: string) => {
        logger.info(`File ${dirPath} has been removed`)

        this.removeProject(path.join(dirPath, 'README.md'))
      })
      .on('raw', (event) => {
        if (event === 'moved') {
          this.projects.forEach((project) => {
            if (!existsSync(project.path)) {
              this.removeProject(project)
            }
          })
        }
      })
  }

  getProjects(): Project[] {
    return this.projects
  }
}
