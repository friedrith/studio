import createDeepLink from 'desktop-deep-link'
import Plugin from '../models/Plugin'
import Link from '../models/Link'

export default class TimeTracker extends Plugin {
  constructor() {
    super('studio.link-transformer')
    this.scopes = ['link']
  }

  // eslint-disable-next-line class-methods-use-this
  transformLink(link: Link): Link {
    return link.href ? { ...link, href: createDeepLink(link.href) } : link
  }
}
