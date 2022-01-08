import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

export const dbFilename = path.join(app.getPath('home'), '.studio/db.json')

const defaultDb = {
  workspaces: [],
}

export const getDb = () =>
  fs
    .readFile(dbFilename, { encoding: 'utf8' })
    .then(JSON.parse)
    .catch(() => defaultDb)

export const saveDb = (config: string) =>
  fs.writeFile(dbFilename, JSON.stringify(config, null, `\t`))
