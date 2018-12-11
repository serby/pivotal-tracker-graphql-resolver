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
    story: '⭐️',
    bug: '🐞'
  }[type] || `[${type}]`
}

const unitMap = {
  point: {
    s: 'Point',
    p: 'Points'
  },
  hour: {
    s: 'Hour',
    p: 'Hours'
  }
}
const displayUnit = amount => {
  return amount === 1 ? unitMap[unit].s : unitMap[unit].p
}

const unit = process.env.UNIT || 'point'
const displayPoints = false
const token = process.env.TOKEN
graphql(createSchema(token), query).then(response => {
  if (response.errors) return console.error(response.errors)
  const { project } = response.data
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

  const markdown = `# ${project.name}

${project.url}
${project.description ? project.description + '\n' : ''}

This project has **${stats.sum}** ${displayUnit(stats.sum).toLowerCase()} in **${stats.count}** stories contained in **${stats.epics}** epics

${
  project.epics.map(epic => {
    if (epic.title.includes('----')) return ''
    return `
## ${epic.title}

${epic.url}

${displayPoints ? `Epic Points: ${epic.sum}` : ''}
${epic.description ? '\n' + epic.description + '\n' : ''}
${
  sortBy(epic.stories, 'title').map(story => `1. ${typeToEmoji(story.type)} ${story.title} [[${story.id}]](${story.url}) ${displayPoints && story.points ? `- ${story.points} ${displayUnit(story.points)}` : ''}
${story.description ? '\n' + story.description + '\n' : ''}`).join('')
}
`
  }).join('')}
`
  console.log(markdown)
}).catch(error => {
  console.error(error)
})
