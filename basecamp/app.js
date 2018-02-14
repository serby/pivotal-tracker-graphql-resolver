const createSchema = require('./schema')
const { graphql } = require('graphql')

const accountId = process.env.ACCOUNT_ID
const projectId = 13225818
const query = `
{
  project(id:${projectId}) {
    name
    description
    createdDate
    url
    topics {
      title
      createdDate
      url
      comments {
        id
        content
      }
    }
  }
}
`

graphql(createSchema({ accountId }), query).then(response => {
  if (response.errors) return console.error(response.errors)
  console.log(response.data.project)
})
