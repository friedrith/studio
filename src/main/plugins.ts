import Settings from 'types/Settings'
import Plugin from '../types/Plugin'

import TimeTracker from '../plugins/TimeTracker'
import DeepLinkTransformer from '../plugins/DeepLinkTransformer'
import VSCode from '../plugins/VSCode'
import ITerm from '../plugins/ITerm'
import MarkdownLoader from '../plugins/MarkdownLoader'
import Todoist from '../plugins/Todoist'

const plugins: Array<Plugin> = [
  new TimeTracker(),
  new DeepLinkTransformer(),
  new ITerm(),
  new VSCode(),
  new MarkdownLoader(),
  new Todoist(),
]

// eslint-disable-next-line import/prefer-default-export
export const enabledPlugins = (settings: Settings) =>
  plugins.filter((p) => settings.pluginsEnabled.includes(p.id))
