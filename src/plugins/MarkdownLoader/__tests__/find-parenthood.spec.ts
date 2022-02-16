import Project from '../../../types/Project'

import findParenthood from '../find-parenthood'

const aProject = (id: string, path: string) => {
  const project = new Project()
  project.setId(id)
  project.setPath(path)

  return project
}

describe('findParenthood', () => {
  it('should update parent', () => {
    const parentProject = aProject('parent', '/foo/bar')

    const project = aProject('parent', '/foo/bar/foo2')

    findParenthood(project, [parentProject])

    expect(project.parent).toEqual(parentProject)
    expect(parentProject.children).toEqual([project])
  })

  it('should not update parent', () => {
    const parentProject = aProject('parent', '/foo/bar')

    const project = aProject('parent', '/foo/bar2/')

    findParenthood(project, [parentProject])

    expect(project.parent).toEqual(undefined)
    expect(parentProject.children).toEqual([])
  })
})
