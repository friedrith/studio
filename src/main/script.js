import { exec } from 'child_process'
import { readFile } from 'fs/promises'
import path from 'path'

export default async (scriptName) => {
  const scriptFilename = path.join(
    __dirname,
    '../../templates',
    `${scriptName}.txt`
  )
  const content = await readFile(scriptFilename, { encoding: 'utf8' })
  console.log('content', content)
  try {
    exec(`osascript -e ${content}`)
  } catch (error) {
    console.error('error', error)
  }
}
