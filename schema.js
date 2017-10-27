const createProjectFetcher = require('./project-fetcher')
const createEpicsFetcher = require('./epics-fetcher')
const createStoriesFetcher = require('./stories-fetcher')
const createBlockerFetcher = require('./blocker-fetcher')

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
  const fetchEpics = createEpicsFetcher(token)
  const fetchBlocker = createBlockerFetcher(token)

  const ProjectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => ({
      id: { type: GraphQLInt },
      url: {
        type: GraphQLString,
        resolve: (root) => {
          return `https://www.pivotaltracker.com/n/projects/${root.id}`
        }
      },
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      epics: {
        type: new GraphQLList(EpicType),
        args: {
          label: { type: GraphQLString }
        },
        resolve: (project, args, context) => {
          return fetchEpics(project.id, args.label)
        }
      },
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

  const EpicType = new GraphQLObjectType({
    name: 'Epic',
    fields: () => ({
      id: {
        type: GraphQLInt
      },
      url: {
        type: GraphQLString,
        resolve: root => `https://www.pivotaltracker.com/epic/show/${root.id}`
      },
      title: {
        type: GraphQLString,
        resolve: root => root.name
      },
      description: {
        type: GraphQLString,
        resolve: root => root.description
      },
      label: {
        type: GraphQLString,
        resolve: root => root.label.name
      },
      stories: {
        type: new GraphQLList(StoryType),
        args: {
          label: { type: GraphQLString }
        },
        resolve: (epic, args, context) => {
          return fetchStories(epic.project_id, epic.label.name)
        }
      }
    })
  })

  const BlockerType = new GraphQLObjectType({
    name: 'Blocker',
    fields: () => ({
      description: {
        type: GraphQLString
      },
      resolved: {
        type: GraphQLString
      }
    })
  })

  const StoryType = new GraphQLObjectType({
    name: 'Story',
    fields: () => ({
      id: {
        type: GraphQLInt
      },

      url: {
        type: GraphQLString,
        resolve: root => `https://www.pivotaltracker.com/story/show/${root.id}`
      },
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
      state: {
        type: GraphQLString,
        resolve: root => root.current_state
      },
      blockers: {
        type: new GraphQLList(BlockerType),
        resolve: (story) => {
          return fetchBlocker(story.id, story.project_id)
        }
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
