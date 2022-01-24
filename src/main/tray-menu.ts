import { shell, clipboard, Menu, MenuItem } from 'electron'
import path from 'path'
import ejs from 'ejs'
import { getSettings, settingsFilename } from './utils/settings'
import { getDb, saveDb } from './utils/db'
import projectSettings from './utils/project-settings'

import Project from '../types/Project'
import Link from '../types/Link'
import Plugin from '../types/Plugin'
import PluginOptions from '../types/PluginOptions'
import Settings from '../types/Settings'

const isStared = (link: Link) => link.stared
const isNotStared = (link: Link) => !isStared(link)

const isStartedShortcutPlugin =
  (pluginOptions: PluginOptions) => (plugin: Plugin) =>
    (pluginOptions.staredShortcuts || []).includes(plugin.id)
const isNotStartedShortcutPlugin =
  (pluginOptions: PluginOptions) => (plugin: Plugin) =>
    !isStartedShortcutPlugin(pluginOptions)(plugin)

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
  icon: path.join(__dirname, `../../assets/ranks/${project.rank}.png`),
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
    if (link.click) {
      link.click()
    }
  },
  submenu: link.submenu,
})

const separator = (props = {}): any => ({ type: 'separator', ...props })

const buildPluginOptions = async (
  plugins: Array<Plugin>,
  originalPluginOptions: PluginOptions
): Promise<PluginOptions> => {
  const dataPromises = plugins
    .filter(Plugin.onlyScope('data'))
    .map((plugin: Plugin) => plugin.getData(originalPluginOptions))

  const pluginsData = await Promise.all(dataPromises)

  return pluginsData.reduce(
    (acc: PluginOptions, pluginData: PluginOptions) => ({
      ...acc,
      ...pluginData,
    }),
    originalPluginOptions
  )
}

const buildShortcutMenuItems = async (
  plugins: Array<Plugin>,
  pluginOptions: PluginOptions
) => {
  const promise = plugins
    .filter(Plugin.onlyScope('shortcuts'))
    .map((plugin: Plugin) => plugin.createShortcut(pluginOptions))

  return (await Promise.all(promise)).filter((item) => item.label)
}

const buildLinks = async (
  plugins: Array<Plugin>,
  links: Array<Link>,
  pluginOptions: PluginOptions
) =>
  plugins
    .filter(Plugin.onlyScope('links'))
    .reduce(
      async (acc: Promise<Array<Link>>, plugin: Plugin) =>
        plugin.transformLinks(await acc, pluginOptions),
      Promise.resolve(links)
    )

const renderTemplate = (property: string, pluginOptions: PluginOptions) =>
  property ? ejs.render(property, pluginOptions) : ''

export default async (
  refresh: () => void,
  projects: Array<Project>,
  createWindow: () => void,
  plugins: Array<Plugin>
) => {
  const settings: Settings = await getSettings()
  const db: any = await getDb()

  const activeProject: Project | undefined = projects.find(
    (p: Project) => p.id === db.active
  )

  const originalPluginOptions: PluginOptions = {
    activeProject,
    projects,
    ...settings,
  }

  const pluginOptions = await buildPluginOptions(plugins, originalPluginOptions)

  const title = renderTemplate(settings.menuTitle, pluginOptions)

  const subTitle = renderTemplate(settings.subTitle, pluginOptions)

  const links = await buildLinks(
    plugins,
    activeProject?.links || [],
    pluginOptions
  )

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

  const staredShortcutPlugins = plugins.filter(
    isStartedShortcutPlugin(pluginOptions)
  )

  const staredShortcutMenuItems = await buildShortcutMenuItems(
    staredShortcutPlugins,
    pluginOptions
  )

  const notStaredShortcutPlugins = plugins.filter(
    isNotStartedShortcutPlugin(pluginOptions)
  )

  const notStaredShortcutMenuItems = await buildShortcutMenuItems(
    notStaredShortcutPlugins,
    pluginOptions
  )

  contextMenu = Menu.buildFromTemplate([
    new MenuItem({
      label: subTitle,
      enabled: false,
      visible: subTitle,
    }),
    ...staredShortcutMenuItems,
    separator({ visible: subTitle || staredShortcutMenuItems.length > 0 }),
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
      label: 'Shortcuts',
      submenu: notStaredShortcutMenuItems,
      visible: notStaredShortcutMenuItems.length > 0,
    },
    // {
    //   label: 'Create Project',
    //   click: async () => {
    //     await runScript('open-iterm')
    //   },
    // },
    separator(),
    {
      label: 'Open Project Page',
      click: () => {
        activeProject?.configFilepaths.forEach((filepath: string) => {
          shell.openExternal(
            `obsidian://open?path=${filepath.replace('.md', '')}`
          )
        })
      },
      visible: activeProject,
    },
    {
      label: 'Open Global Settings',
      click: () => {
        shell.openExternal(`vscode://file${settingsFilename}`)
      },
    },
    // {
    //   label: 'Open Project Settings',
    //   click: async () => {
    //     if (activeProject) {
    //       const filename = await projectSettings.createTemporarySettingsFile(
    //         activeProject?.id
    //       )

    //       console.log('filename', filename)

    //       shell.openExternal(`vscode://file${filename}`)
    //     }
    //   },
    //   visible: activeProject,
    // },
    {
      label: 'Refresh',
      click: () => {
        refresh()
      },
      visible: settings.showRefresh,
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
