import createDeepLink from 'desktop-deep-link'
import Plugin from '../types/Plugin'
import Link from '../types/Link'

export default class DeepLinkTransformer extends Plugin {
  constructor() {
    super('studio.deep-link-transformer')
    this.scopes = ['links']
  }

  // eslint-disable-next-line class-methods-use-this
  transformLinks(links: Array<Link>): Array<Link> {
    return links.map((link) =>
      link.href ? { ...link, href: createDeepLink(link.href) } : link
    )
  }
}
