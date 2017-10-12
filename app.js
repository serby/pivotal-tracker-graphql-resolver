const createSchema = require('./schema')
const { graphql } = require('graphql')
const sortBy = require('lodash.sortby')
const Table = require('cli-table')

const hourlyRate = 95
const dayLength = 8 / 1.2

const query = `
{
  project(id:2114927) {
    name
    description
    stories {
      title
      points
      labels
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
  const totals = totalLabels(response.data.project.stories)
  const output = Object.keys(totals).map(key => cost(key, totals[key]))
  const table = new Table({ head: Object.keys(output[0]) })
  sortBy(output, 'hours').forEach(row => table.push(Object.values(row)))
  console.log(table.toString())
  console.log({ hourlyRate, dayLength, total: hourlyRate })
})
