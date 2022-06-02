// import Settings from 'types/Settings'
import Plugin from '../types/Plugin'

// import TimeTracker from '../plugins/TimeTracker'
import DeepLinkTransformer from '../plugins/DeepLinkTransformer'
import VSCode from '../plugins/VSCode'
import ITerm from '../plugins/ITerm'
import MarkdownLoader from '../plugins/MarkdownLoader'
import Todoist from '../plugins/Todoist'
import GlobalLink from '../plugins/GlobalLink'
import Settings from '../types/Settings'
import PluginOptions, { PluginOptionsMap } from '../types/PluginOptions'
import Project from '../types/Project'
import GlobalContext from '../types/GlobalContext'
import Link from '../types/Link'

const allPlugins: Array<Plugin> = [
  // new TimeTracker(),
  new DeepLinkTransformer(),
  new ITerm(),
  new VSCode(),
  new MarkdownLoader(),
  new Todoist(),
  new GlobalLink(),
]

// eslint-disable-next-line import/prefer-default-export
export const enabledPlugins = (settings: Settings) =>
  allPlugins.filter((p) => settings.pluginsEnabled.includes(p.id))

export const buildPluginOptions = (
  plugins: Array<Plugin>,
  { plugins: pluginSettings, ...settings }: Settings,
  projects: Project[],
  activeProject: Project | undefined
): { [id: string]: PluginOptions } =>
  plugins.reduce(
    (acc, plugin) => ({
      ...acc,
      [plugin.id]: {
        ...settings,
        projects,
        activeProject,
        settings,
        plugin: pluginSettings[plugin.id],
      },
    }),
    {}
  )

export const buildGlobalContext = (
  plugins: Array<Plugin>,
  { plugins: pluginSettings, ...settings }: Settings,
  projects: Project[],
  activeProject: Project | undefined,
  pluginOptionsByPlugin: PluginOptionsMap
): GlobalContext => ({
  ...settings,
  projects,
  activeProject,
  plugins: Promise.all(
    plugins.map((p) => p.getContext(pluginOptionsByPlugin[p.id]))
  ),
})

export const isStartedShortcutPlugin =
  (settings: Settings) => (plugin: Plugin) =>
    (settings.staredShortcuts || []).includes(plugin.id)

export const isNotStartedShortcutPlugin =
  (settings: Settings) => (plugin: Plugin) =>
    !isStartedShortcutPlugin(settings)(plugin)

export const buildLinks = async (
  plugins: Plugin[],
  links: Array<Link>,
  pluginOptionsByPlugin: PluginOptionsMap
) =>
  plugins
    .filter(Plugin.onlyScope('links'))
    .reduce(
      async (acc: Promise<Array<Link>>, plugin: Plugin) =>
        plugin.transformLinks(await acc, pluginOptionsByPlugin[plugin.id]),
      Promise.resolve(links)
    )
