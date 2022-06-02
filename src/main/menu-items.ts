import { shell, clipboard } from 'electron'
import path from 'path'

import Project from '../types/Project'
import Link from '../types/Link'
import Plugin from '../types/Plugin'
import { PluginOptionsMap } from '../types/PluginOptions'

export const buildProjectMenuItem =
  (activeProject: Project | undefined, onClick: any) =>
  (project: Project): any => ({
    label: project.alias || project.name,
    type: 'radio',
    checked: project.id === activeProject?.id,
    click: () => onClick(project),
    icon: path.join(__dirname, `../../assets/rank2/${project.rank}.png`),
  })

export const buildLinkMenuItem = (link: Link): any => ({
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

export const separator = (props = {}): any => ({ type: 'separator', ...props })

export const buildShortcutMenuItems = async (
  plugins: Array<Plugin>,
  pluginOptionsByPlugin: PluginOptionsMap
) => {
  const promise = plugins
    .filter(Plugin.onlyScope('shortcuts'))
    .map((plugin: Plugin) =>
      plugin.createShortcut(pluginOptionsByPlugin[plugin.id])
    )

  return (await Promise.all(promise)).filter((item) => item.label)
}
