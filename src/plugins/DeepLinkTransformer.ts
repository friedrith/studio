import createDeepLink from 'desktop-deep-link'
import Plugin from '../models/Plugin'
import Link from '../models/Link'

export default class DeepLinkTransformer extends Plugin {
  constructor() {
    super('studio.deep-link-transformer')
    this.scopes = ['link']
  }

  // eslint-disable-next-line class-methods-use-this
  transformLinks(links: Array<Link>): Array<Link> {
    return links.map((link) =>
      link.href ? { ...link, href: createDeepLink(link.href) } : link
    )
  }
}
