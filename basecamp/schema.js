const createProjectFetcher = require('./project-fetcher')
const createTopicFetcher = require('./topic-fetcher')
const basecampfetch = require('./fetcher')

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = require('graphql')

const createSchema = ({ accountId }) => {
  const fetchProject = createProjectFetcher(accountId)
  const fetchTopic = createTopicFetcher(accountId)

  const CreatorType = new GraphQLObjectType({
    name: 'Creator',
    fields: {
      id: { type: GraphQLString }
    }
  })

  const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({
      id: { type: GraphQLInt },
      content: { type: GraphQLString },
      createdDate: {
        type: GraphQLString,
        resolve: root => new Date(root['created_at'])
      },
      creator: { type: CreatorType }
    })
  })

  const TopicType = new GraphQLObjectType({
    name: 'Topic',
    fields: () => ({
      id: { type: GraphQLInt },
      title: { type: GraphQLString },
      createdDate: {
        type: GraphQLString,
        resolve: root => new Date(root['created_at'])
      },
      url: {
        type: GraphQLString,
        resolve: root => root.topicable.app_url
      },
      comments: {
        type: new GraphQLList(CommentType),
        resolve: async topic => {
          const actualTopic = await basecampfetch(topic.topicable.url)
          return actualTopic.comments
        }
      }
    })
  })

  const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
      id: { type: GraphQLInt },
      url: {
        type: GraphQLString,
        resolve: root => `https://basecamp.com/${accountId}/projects/${root.id}`
      },
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      createdDate: {
        type: GraphQLString,
        resolve: root => new Date(root['created_at'])
      },
      topics: {
        type: new GraphQLList(TopicType),
        resolve: async (project) => {
          const topics = await fetchTopic({ projectId: project.id })
          return topics.map(topic => ({ ...topic, projectId: project.id }))
        }
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
        },
        projects: {
          type: new GraphQLList(ProjectType),
          resolve: (epic, args, context) => fetchProject()
        }
      })
    })
  })
}

module.exports = createSchema
