import Workspace from '../../types/Workspace'

export const onlyMarkdown = (workspace: Workspace) =>
  workspace.type === 'markdown'

export const projectFileRegex = (workspace: Workspace) =>
  `${workspace.uri}/**/README.md`
