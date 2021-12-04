export default class Project {
  name: string;

  links: Array<{ href: string, label: string }>;

  constructor() {
    this.name = '';
    this.links = [];
  }
}
