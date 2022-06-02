import { shell, Menu, MenuItem } from 'electron'
import ejs from 'ejs'
import { getSettings, settingsFilename } from './utils/settings'
import { getDb, saveDb } from './utils/db'
import {
  isStartedShortcutPlugin,
  isNotStartedShortcutPlugin,
  buildPluginOptions,
  buildGlobalContext,
  buildLinks,
} from './plugins'

import Project from '../types/Project'
import { isStaredLink, isUnstaredLink } from '../types/Link'
import Plugin from '../types/Plugin'
import Settings from '../types/Settings'
import GlobalContext from '../types/GlobalContext'
import Database from '../types/Database'
import {
  buildProjectMenuItem,
  buildLinkMenuItem,
  separator,
  buildShortcutMenuItems,
} from './menu-items'

let contextMenu: Menu | null = null

const renderTemplate = (property: string, context: GlobalContext) =>
  property ? ejs.render(property, context) : ''

export default async (
  refresh: () => void,
  projects: Array<Project>,
  createWindow: () => void,
  plugins: Array<Plugin>
) => {
  const settings: Settings = await getSettings()
  const db: Database = await getDb()

  const activeProject = projects.find((p: Project) => p.id === db.active)

  const pluginOptionsByPlugin = buildPluginOptions(
    plugins,
    settings,
    projects,
    activeProject
  )

  const globalContext = buildGlobalContext(
    plugins,
    settings,
    projects,
    activeProject,
    pluginOptionsByPlugin
  )

  const title = renderTemplate(settings.menuTitle, globalContext)
  const subTitle = renderTemplate(settings.subTitle, globalContext)

  const links = await buildLinks(
    plugins,
    activeProject?.links || [],
    pluginOptionsByPlugin
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

  const staredLinks = links.filter(isStaredLink).map(buildLinkMenuItem)
  const unstaredLinks = links.filter(isUnstaredLink).map(buildLinkMenuItem)

  const notMostRecentUsedProjects = projects.filter(
    (p: Project) => !db.mostRecentUsedProjects.includes(p.id)
  )

  const orderedProjects = [
    ...db.mostRecentUsedProjects.map((id: string) =>
      projects.find((p: Project) => p.id === id)
    ),
    ...notMostRecentUsedProjects,
  ]
    .filter(Boolean)
    .map((p) => p as Project)

  const staredShortcutPlugins = plugins.filter(
    isStartedShortcutPlugin(settings)
  )

  const staredShortcutMenuItems = await buildShortcutMenuItems(
    staredShortcutPlugins,
    pluginOptionsByPlugin
  )

  const notStaredShortcutPlugins = plugins.filter(
    isNotStartedShortcutPlugin(settings)
  )

  const notStaredShortcutMenuItems = await buildShortcutMenuItems(
    notStaredShortcutPlugins,
    pluginOptionsByPlugin
  )

  const notStaredOneShotShortcutsMenuItems = notStaredShortcutMenuItems.filter(
    (i) => i.oneShot
  )

  const notStaredNotOneShotShortcutsMenuItems =
    notStaredShortcutMenuItems.filter((i) => !i.oneShot)

  contextMenu = Menu.buildFromTemplate([
    new MenuItem({
      label: subTitle,
      enabled: false,
      visible: subTitle,
    }),
    ...staredShortcutMenuItems,
    separator({ visible: subTitle || staredShortcutMenuItems.length > 0 }),
    {
      label: 'Projects',
      submenu: [
        ...orderedProjects.map(
          buildProjectMenuItem(activeProject, selectProject)
        ),
        separator({ visible: false }),
        // { label: 'Other project', visible: false },
        // {
        //   label: 'Deactivate current project',
        //   visible: activeProject !== undefined,
        //   click: async () => {
        //     db.active = null
        //     await saveDb(db)
        //     refresh()
        //   },
        //   icon: path.join(__dirname, `../../assets/ranks/invisible.png`),
        // },
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
      submenu: [
        ...notStaredNotOneShotShortcutsMenuItems,
        separator({
          visible: notStaredNotOneShotShortcutsMenuItems.length > 0,
        }),
        ...notStaredOneShotShortcutsMenuItems,
      ],
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
      label: 'Project Page',
      click: () => {
        activeProject?.configFilepaths.forEach((filepath: string) => {
          // console.log('open PRoject page')
          shell.openExternal(
            `obsidian://open?path=${filepath.replace('.md', '')}`
          )

          // shell.openPath(filepath)
        })
      },
      visible: activeProject,
    },
    {
      label: 'Settings',
      click: () => {
        shell.openPath(settingsFilename)

        // shell.openExternal(`vscode://file${settingsFilename}`)
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
      visible: false,
    },
  ])

  return { menu: contextMenu, title }
}
