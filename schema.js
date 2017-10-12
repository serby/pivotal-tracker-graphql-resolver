const createProjectFetcher = require('./project-fetcher')
const createStoriesFetcher = require('./stories-fetcher')

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = require('graphql')

const createSchema = token => {
  const fetchProject = createProjectFetcher(token)
  const fetchStories = createStoriesFetcher(token)

  const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      stories: {
        type: new GraphQLList(StoryType),
        args: {
          label: { type: GraphQLString }
        },
        resolve: (project, args, context) => {
          return fetchStories(project.id, args.label)
        }
      }
    })
  })

  const StoryType = new GraphQLObjectType({
    name: 'Story',
    fields: () => ({
      title: {
        type: GraphQLString,
        resolve: root => root.name
      },
      description: {
        type: GraphQLString,
        resolve: root => root.description
      },
      points: {
        type: GraphQLInt,
        resolve: root => root.estimate
      },
      type: {
        type: GraphQLString,
        resolve: root => root.kind
      },
      labels: {
        type: new GraphQLList(GraphQLString),
        resolve: root => root.labels.map(label => label.name)
      }
    })
  })

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      description: '...',
      fields: () => ({
        project: {
          type: ProjectType,
          args: {
            id: { type: GraphQLInt }
          },
          resolve: (root, args, context) => fetchProject(args.id)
        }
      })
    })
  })
}

module.exports = createSchema
