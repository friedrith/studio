import {
  generateFilename,
  getJsonFile,
  saveJsonFile,
} from '../../utils/json-file'

export const dbFilename = generateFilename('db')

const defaultDb = {
  workspaces: [],
}

export const getDb = () => getJsonFile(dbFilename, defaultDb)

export const saveDb = (config: string) => saveJsonFile(dbFilename, config)
