import createDeepLink, { Options } from 'desktop-deep-link'
import Plugin from '../types/Plugin'
import Link from '../types/Link'

export default class DeepLinkTransformer extends Plugin {
  settings: Options

  constructor() {
    super('studio.deep-link-transformer')
    this.scopes = ['links']
    this.settings = {}
  }

  async reload() {
    this.settings = await this.getSettings()
  }

  // eslint-disable-next-line class-methods-use-this
  transformLinks(links: Array<Link>): Promise<Array<Link>> {
    return Promise.resolve(
      links.map((link) =>
        link.href
          ? { ...link, href: createDeepLink(link.href, this.settings) }
          : link
      )
    )
  }
}
