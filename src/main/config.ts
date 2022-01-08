import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

export const configFilename = path.join(
  app.getPath('home'),
  '.studio/settings.json'
)

const defaultConfig = {
  workspaces: [],
}

export const getConfig = () =>
  fs
    .readFile(configFilename, { encoding: 'utf8' })
    .then(JSON.parse)
    .catch(() => defaultConfig)

export const saveConfig = (config: string) =>
  fs.writeFile(configFilename, JSON.stringify(config, null, `\t`))
