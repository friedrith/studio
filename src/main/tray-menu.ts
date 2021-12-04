import { shell, clipboard, Menu, MenuItem } from 'electron'
import { getConfig, saveConfig, configFilename } from './config'

interface Link {
  label: string
  href?: string
  clipboard?: string
  file?: string
  stared: boolean
}
interface Project {
  id: string
  name: string
  links: Array<Link>
}

const isStared = (link: Link) => link.stared
const isNotStared = (link: Link) => !isStared(link)

let contextMenu: Menu | null = null

const buildProjectMenuItem = (
  activeProject: Project | null,
  project: Project,
  onClick: any
): MenuItem =>
  new MenuItem({
    label: project.name,
    type: 'radio',
    checked: project.id === activeProject?.id,
    click: () => onClick(project),
  })

const buildLinkMenuItem = (link: Link): MenuItem =>
  new MenuItem({
    label: link.label,
    click: async () => {
      if (link.href) {
        await shell.openExternal(link.href)
      }
      if (link.clipboard) {
        clipboard.writeText(link.clipboard)
      }
      if (link.file) {
        await shell.openPath(link.file)
      }
    },
  })

const separator: MenuItem = new MenuItem({ type: 'separator' })

export default async (refresh: () => void, createWindow: () => void) => {
  const config: any = await getConfig()

  const activeProject: Project | null = config.projects.find(
    (p: Project) => p.id === config.active
  )

  const title = activeProject?.name || ''

  const links = activeProject?.links || []

  const selectProject = async (project: Project) => {
    config.active = project.id
    await saveConfig(config)
    refresh()
  }

  const staredLinks = links.filter(isStared).map(buildLinkMenuItem)
  const unstaredLinks = links.filter(isNotStared).map(buildLinkMenuItem)

  const more =
    unstaredLinks.length > 0
      ? [
          {
            label: 'More...',
            submenu: unstaredLinks,
          },
        ]
      : []

  contextMenu = Menu.buildFromTemplate([
    // {
    //   label: 'Project: Freelance',
    //   click: () => {},
    // },
    // {
    //   label: 'Stop active project', click: () => {

    //   }
    // },
    {
      label: 'Switch active project',
      submenu: [
        ...config.projects.map((p: Project) =>
          buildProjectMenuItem(activeProject, p, selectProject)
        ),
        separator,
        { label: 'Other project' },
      ],
    },
    separator,
    ...staredLinks,
    ...more,
    separator,
    {
      label: 'Preferences',
      click: async () => {
        createWindow()
      },
    },
    {
      label: 'Settings',
      click: () => {
        shell.openExternal(`vscode://file${configFilename}`)
        // shell.showItemInFolder(getConfigFilename)
      },
    },
    {
      label: 'Refresh',
      click: () => {
        refresh()
      },
    },
  ])

  return { menu: contextMenu, title }
}
