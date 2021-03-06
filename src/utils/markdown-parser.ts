import { readFile, writeFile } from 'fs/promises'
import yaml from 'js-yaml'
import { markdown } from 'markdown'

// import Project from 'models/Project'

import Link from '../types/Link'
import ProjectInfos from '../types/ProjectInfos'

const findLinks = (content): Array<Link> => {
  if (content[0][0] === 'link') {
    const link = content[0]
    return [
      {
        label: link[2],
        href: link[1].href,
        stared: true,
      },
    ]
  }

  return []
}

const findHeader1 = (tree): string =>
  tree.find((line) => line[0] === 'header' && line[1].level === 1)?.[2]

const findHeaderLinksIndex = (tree): number =>
  tree.findIndex(
    (line) => line[0] === 'header' && line[1].level === 2 && line[2] === 'Links'
  )

const parseYamlFrontMatter = (content: string): ProjectInfos => {
  const frontMatterMatch = content.match(/---((.|\n|\r\n)*)---/)

  let frontMatter = {}

  try {
    if (frontMatterMatch) {
      frontMatter = yaml.load(frontMatterMatch[1])
    }
  } catch (error) {
    console.error('front matter invalid', error)
  }

  return frontMatter
}

export const parseMarkdown = async (
  filePath: string
): Promise<ProjectInfos> => {
  const content = await readFile(filePath, { encoding: 'utf8' })

  const frontMatter = parseYamlFrontMatter(content)

  const tree = markdown.parse(content)

  const name = findHeader1(tree) || ''

  const links: Array<Link> = []

  const linksSectionIndex = findHeaderLinksIndex(tree)

  try {
    if (linksSectionIndex >= 0) {
      const list = tree[linksSectionIndex + 1]
      if (list[0] === 'bulletlist') {
        list.slice(1).forEach((item) => {
          if (item[0] === 'listitem') {
            findLinks(item.slice(1)).forEach((link: Link) => {
              links.push(link)
            })
          }
        })
      }

      const otherLinksIndex = tree.findIndex(
        (line) => line[0] === 'para' && line[1].includes('other link')
      )

      const list2 = tree[otherLinksIndex + 1]
      if (list2[0] === 'bulletlist') {
        list2.slice(1).forEach((item) => {
          if (item[0] === 'listitem') {
            findLinks(item.slice(1)).forEach((link: Link) => {
              links.push({
                ...link,
                stared: false,
              })
            })
          }
        })
      }
    }
  } catch (error) {
    // console.error('error', error, filePath)
  }

  return {
    name,
    links,
    ...frontMatter,
  }
}

export const rewriteFrontMatter = async (newId: string, filePath: string) => {
  try {
    const content = await readFile(filePath, { encoding: 'utf8' })

    const frontMatter = parseYamlFrontMatter(content)

    if (frontMatter.id === 'generate') {
      let contentToAdd = ''
      contentToAdd += `id: ${newId}`

      if (!frontMatter.date) {
        contentToAdd += `\ndate: ${new Date()}`
      }

      const newContent = content.replace('id: generate', contentToAdd)

      await writeFile(filePath, newContent)
    }
  } catch (error) {
    console.error('error', error)
  }
}

export const parseYaml = async (filePath: string) => {
  const content = await readFile(filePath, { encoding: 'utf8' })
  return yaml.load(content)
}
