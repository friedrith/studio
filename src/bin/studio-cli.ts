import path from 'path'
import { mkdir, readFile, writeFile } from 'fs/promises'
import ejs from 'ejs'
import { v4 as uuidv4 } from 'uuid'
import commandLineArgs from 'command-line-args'
import prompts from 'prompts'

import Project from '../types/Project'

// npx ts-node ~/Code/studio/src/bin/studio-cli.ts --create

const optionDefinitions = [
  { name: 'create', alias: 'c', type: String },
  { name: 'name', alias: 'n', type: String },
  { name: 'alias', type: String, default: '' },

  // { name: 'src', type: String, multiple: true, defaultOption: true },
  // { name: 'timeout', alias: 't', type: Number },
]

const args = commandLineArgs(optionDefinitions)

const templateFolder = path.join(__dirname, '../../templates')

const createProjectFile =
  (project: Project, data) =>
  async (filename: string): Promise<number> => {
    const projectFileTemplateFilename = path.join(templateFolder, filename)
    const content = await readFile(projectFileTemplateFilename, {
      encoding: 'utf8',
    })
    const updatedContent = ejs.render(content, data)
    const projectFilename = path.join(project.path, filename)
    await writeFile(projectFilename, updatedContent)

    return 0
  }

const createProject = async ({ create, name, alias }) => {
  const project = new Project()

  project.path = path.join(process.cwd(), create)
  project.name = name || path.basename(project.path)
  project.alias = alias

  project.id = uuidv4()

  await mkdir(project.path)

  const data = { project }

  const promises = ['README.md', '.studio.yml', '.studio.p.yml'].map(
    createProjectFile(project, data)
  )

  await Promise.all(promises)
}

if (args.create) {
  createProject(args)
} else {
  ;(async () => {
    const questions = [
      {
        type: 'text',
        name: 'create',
        message: 'Path of the project',
        // validate: (value) => (value < 18 ? `Nightclub is 18+ only` : true),
      },
      {
        type: 'text',
        name: 'name',
        message: 'Name of the project',
        // validate: (value) => (value < 18 ? `Nightclub is 18+ only` : true),
      },
      {
        type: 'text',
        name: 'alias',
        message: 'Alias of the project',
        // validate: (value) => (value < 18 ? `Nightclub is 18+ only` : true),
      },
    ].filter((p) => !args[p])

    const response = await prompts(questions)
    createProject(response)
  })()
}
