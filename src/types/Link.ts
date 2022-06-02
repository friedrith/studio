import { MenuItemConstructorOptions } from 'electron'

export default interface Link {
  label: string
  href?: string
  clipboard?: string
  file?: string
  stared: boolean
  submenu?: MenuItemConstructorOptions
  click?: () => void
}

export const isStaredLink = (link: Link) => link.stared
export const isUnstaredLink = (link: Link) => !isStaredLink(link)
