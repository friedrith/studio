import { shell, clipboard, Menu, MenuItem } from 'electron'
import ejs from 'ejs'
import { getConfig, configFilename } from './config'
import { getDb, saveDb } from './db'

import Project from '../models/Project'
import Link from '../models/Link'
import Plugin, { PluginOptions } from '../models/Plugin'
import runScript from './script'

const isStared = (link: Link) => link.stared
const isNotStared = (link: Link) => !isStared(link)

let contextMenu: Menu | null = null

const buildProjectMenuItem = (
  activeProject: Project | undefined,
  project: Project,
  onClick: any
): any => ({
  label: project.alias || project.name,
  type: 'radio',
  checked: project.id === activeProject?.id,
  click: () => onClick(project),
})

const buildLinkMenuItem = (link: Link): any => ({
  label: link.label,
  click: async () => {
    if (link.href?.startsWith('file://')) {
      await shell.openPath(link.href.replace('file://', ''))
    } else if (link.href) {
      await shell.openExternal(link.href)
    }
    if (link.clipboard) {
      clipboard.writeText(link.clipboard)
    }
  },
})

const separator = (props = {}): any => ({ type: 'separator', ...props })

export default async (
  refresh: () => void,
  projects: Array<Project>,
  createWindow: () => void,
  plugins: Array<Plugin>
) => {
  const config: any = await getConfig()
  const db: any = await getDb()

  const activeProject: Project | undefined = projects.find(
    (p: Project) => p.id === db.active
  )

  const originalData: PluginOptions = { activeProject, projects }

  const dataPromises = plugins
    .filter(Plugin.onlyScope('data'))
    .map((plugin: Plugin) => plugin.getData(originalData))

  const pluginsData = await Promise.all(dataPromises)

  const data: PluginOptions = pluginsData.reduce(
    (acc: PluginOptions, pluginData: PluginOptions) => ({
      ...acc,
      ...pluginData,
    }),
    originalData
  )

  const title = config.menuTitle ? ejs.render(config.menuTitle, data) : ''
  const subTitle = config.subTitle ? ejs.render(config.subTitle, data) : ''

  const links = (activeProject?.links || []).map(Plugin.transformLink(plugins))

  if (db.mostRecentUsedProjects.length === 0) {
    db.mostRecentUsedProjects = projects.map((p: Project) => p.id)
    await saveDb(db)
    refresh()
  }

  const selectProject = async (project: Project) => {
    db.active = project.id
    db.mostRecentUsedProjects = [
      project.id,
      ...db.mostRecentUsedProjects.filter((p) => p !== project.id),
    ]
    await saveDb(db)
    refresh()
  }

  const staredLinks = links.filter(isStared).map(buildLinkMenuItem)
  const unstaredLinks = links.filter(isNotStared).map(buildLinkMenuItem)

  const notMostRecentUsedProjects = projects.filter(
    (p: Project) => !db.mostRecentUsedProjects.includes(p.id)
  )

  const orderedProjects = [
    ...db.mostRecentUsedProjects.map((id: string) =>
      projects.find((p: Project) => p.id === id)
    ),
    ...notMostRecentUsedProjects,
  ].filter(Boolean)

  const itemsPromises = plugins
    .filter(Plugin.onlyScope('menu'))
    .map((plugin: Plugin) => plugin.createMenu(data, config))

  const pluginItems = await Promise.all(itemsPromises)

  contextMenu = Menu.buildFromTemplate([
    new MenuItem({
      label: subTitle,
      enabled: false,
      visible: subTitle,
    }),
    ...pluginItems,
    separator({ visible: subTitle || pluginItems.length > 0 }),
    {
      label: 'Change project',
      submenu: [
        ...orderedProjects.map((p: Project) =>
          buildProjectMenuItem(activeProject, p, selectProject)
        ),
        separator({ visible: false }),
        { label: 'Other project', visible: false },
      ],
    },
    separator(),
    ...staredLinks,
    {
      label: 'More...',
      submenu: unstaredLinks,
      visible: unstaredLinks.length > 0,
    },
    separator(),
    {
      label: 'Create Project',
      click: async () => {
        await runScript('open-iterm')
      },
    },
    {
      label: 'Open Project Configs',
      click: () => {
        activeProject?.configFilepaths.forEach((filepath: string) => {
          shell.openExternal(`vscode://file${filepath}`)
        })
      },
      visible: activeProject,
    },
    {
      label: 'Open Settings File',
      click: () => {
        shell.openExternal(`vscode://file${configFilename}`)
      },
    },
    {
      label: 'Refresh',
      click: () => {
        refresh()
      },
      visible: config.showRefresh,
    },
    {
      label: 'Open Window',
      click: async () => {
        createWindow()
      },
    },
  ])

  return { menu: contextMenu, title }
}
