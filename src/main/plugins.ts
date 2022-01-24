import TimeTracker from '../plugins/TimeTracker'
import DeepLinkTransformer from '../plugins/DeepLinkTransformer'
import VSCode from '../plugins/VSCode'
import Terminal from '../plugins/Terminal'
import Plugin from '../types/Plugin'

const plugins: Array<Plugin> = [
  new TimeTracker(),
  new DeepLinkTransformer(),
  new Terminal(),
  new VSCode(),
]

// eslint-disable-next-line import/prefer-default-export
export const enabledPlugins = (settings) =>
  plugins.filter((p) => settings.pluginsEnabled.includes(p.id))
