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
