const createSchema = require('./schema')
const { graphql } = require('graphql')
const sortBy = require('lodash.sortby')

const hourlyRate = 95
const dayLength = 8 / 1.2
const projectId = process.env.PROJECT_ID
const query = `
{
  project(id:${projectId}) {
    name
    description
    stories {
      title
      points
      labels
      state
    }
  }
}
`

const totalLabels = stories => stories.reduce((totals, story) => {
  story.labels.forEach(label => {
    if (!totals[label]) totals[label] = 0
    totals[label] += story.points
  })
  return totals
}, {})

const cost = (key, total) => {
  return {
    key,
    hours: total,
    days: Number((total / dayLength).toPrecision(2)),
    cost: total * hourlyRate * 1.2
  }
}
const token = process.env.TOKEN
graphql(createSchema(token), query).then(response => {
  //const stories = response.data.project.stories.filter(story => story.points > 0 && story.labels.includes('clock'))

  const stories = response.data.project.stories.filter(story => story.state === 'unscheduled')
  const totals = totalLabels(stories)
  const output = Object.keys(totals).map(key => cost(key, totals[key]))

  sortBy(output, 'key').map(({ key, cost, hours }) => [ key.padStart(30), String(cost).padStart(10), String(hours).padStart(10) ])
    .forEach(row => console.log(row.join('\t')))

  console.log({ hourlyRate, dayLength, total: hourlyRate })
})
