const createSchema = require('./schema')
const { graphql } = require('graphql')
const sortBy = require('lodash.sortby')

const projectId = process.env.PROJECT_ID
const query = `
{
  project(id:${projectId}) {
    url
    name
    description
    epics {
      url
      title
      description
      label
      stories {
        id
        type
        url
        title
        points
      }
    }
  }
}
`

const typeToEmoji = type => {
  return {
    chore: '⚙️',
    feature: '⭐️',
    bug: '🐞'
  }[type] || ''
}

const token = process.env.TOKEN
graphql(createSchema(token), query).then(response => {
  if (response.errors) return console.error(response.errors)
  const { project } = response.data
  console.log(`# ${project.name}\n`)
  console.log(`${project.url}\n`)
  project.description && console.log(project.description, '\n')
  const stats = project.epics.reduce((stats, epic) => {
    stats.count += epic.stories.length
    stats.epics += 1
    epic.sum = epic.stories.reduce((sum, story) => {
      sum += story.points || 0
      return sum
    }, 0)
    stats.sum += epic.sum
    return stats
  }, { count: 0, sum: 0, epics: 0 })
  console.log(`This project has **${stats.sum}** points in **${stats.count}** stories contained in **${stats.epics}** epics\n`)
  project.epics.forEach(epic => {
    if (epic.title.includes('----')) return
    console.log(`## ${epic.title}\n`)
    console.log(`${epic.url}\n`)
    console.log(`Epic Points: ${epic.sum}\n`)
    epic.description && console.log(epic.description, '\n')

    sortBy(epic.stories, 'title').forEach(story => {
      console.log(`* ${typeToEmoji(story.type)}  [${story.title}](${story.url})`, story.points ? `- ${story.points} points` : '')
      story.description && console.log(story.description, '\n')
      story.blockers && story.blockers.length > 0 &&
        console.log(story.blockers.map(blocker => '  * 🚫 ' + blocker.description).join('\n'))
    })
  })
}).catch(error => {
  console.error(error)
})
