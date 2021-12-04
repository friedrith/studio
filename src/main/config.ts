import fs from 'fs/promises'

export const configFilename = '/Users/thibault/.studio/config.json'

export const getConfig = () =>
  fs.readFile(configFilename, { encoding: 'utf8' }).then(JSON.parse)

export const saveConfig = (config: string) =>
  fs.writeFile(configFilename, JSON.stringify(config, null, `\t`))
