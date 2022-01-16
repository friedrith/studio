import {
  generateFilename,
  getJsonFile,
  saveJsonFile,
} from '../../utils/json-file'

export const settingsFilename = generateFilename('settings')

const defaultSettings = {
  workspaces: [],
}

export const getSettings = () => getJsonFile(settingsFilename, defaultSettings)

export const saveSettings = (config: string) =>
  saveJsonFile(settingsFilename, config)
