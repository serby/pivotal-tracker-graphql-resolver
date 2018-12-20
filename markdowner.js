const createSchema = require('./schema')
const { graphql } = require('graphql')
const marked = require('marked')

const projectId = process.env.PROJECT_ID
const query = `
{
  project(id:${projectId}) {
    url
    name
    description
    membership {
      username
      id
    }
    epics {
      url
      title
      description
      label
      stories {
        id
        description
        type
        url
        title
        points
        comments {
          text
          author
        }
      }
    }
  }
}
`

const encodeHtml = str => str.replace(/[\u00A0-\u9999<>&](?!#)/gim, i => '&#' + i.charCodeAt(0) + ';')

const nl2br = input => input.replace(/\n/g, '\n\n')

const markedNl2br = input => marked(nl2br(encodeHtml(input)))

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

  const memberIndex = project.membership.reduce((index, member) => {
    index[member.id] = member.username
    return index
  }, {})

  const html = `<html>
<head><title>${project.name}</title></head>
<body>
<h1>${project.name}</h1>
<p><a href="${project.url}">${project.url}</a></p>
${project.description ? '<p>project.description</p>' : ''}
<p>This project has <strong>${stats.sum}</strong> ${displayUnit(stats.sum).toLowerCase()} in <strong>${stats.count}</strong> stories contained in <strong>${stats.epics}</strong> epics</p>
${project.epics.map(convertEpicToHtml(memberIndex)).join('\n')}
</body>
</html>
`
  console.log(html)
})

const convertEpicToHtml = memberIndex => epic => {
  if (epic.title.includes('----')) return ''
  return `
<h2>${markedNl2br(epic.title)}</h2>
<p><a href="${epic.url}">${epic.url}</a></p>
${displayPoints ? `<p>Epic Points: ${epic.sum}</p>` : ''}
${epic.description ? markedNl2br(epic.description) : ''}
${epic.stories.length > 0 ? `<ol>${epic.stories.map(convertStoryToHtml(memberIndex)).join('')}</ol>` : ''}
`
}

const convertCommentToHtml = memberIndex => comment => comment.text ? `<p>@${memberIndex[comment.author]} - ${comment.text}</p>` : ''

const convertCommentsToHtml = (memberIndex, comments) => {
  if (comments && comments.length > 0) {
    const out = comments.map(convertCommentToHtml(memberIndex)).join('')
    if (out.length > 0) return `<h3>Comments</h3>${out}`
  }
  return ''
}

const convertStoryToHtml = memberIndex => story => `
<li>${markedNl2br(typeToEmoji(story.type) + ' ' + `${story.title} [${story.id}](${story.url}) ${displayPoints && story.points ? `- ${story.points} ${displayUnit(story.points)}` : ''}`)}
${story.description ? `${markedNl2br(story.description)}` : ''}
${convertCommentsToHtml(memberIndex, story.comments)}`
