import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

export const generateFilename = (basename: string) =>
  path.join(app.getPath('home'), `.studio/${basename}.json`)

export const getJsonFile = (filename: string, defaultData: any): any =>
  fs
    .readFile(filename, { encoding: 'utf8' })
    .then(JSON.parse)
    .then((data) => ({ ...defaultData, ...data }))
    .catch(() => defaultData)

export const saveJsonFile = (filename: string, data: any) =>
  fs.writeFile(filename, JSON.stringify(data, null, `\t`))
