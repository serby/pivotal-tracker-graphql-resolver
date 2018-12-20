const createProjectFetcher = require('./project-fetcher')
const createEpicsFetcher = require('./epics-fetcher')
const createStoriesFetcher = require('./stories-fetcher')
const createBlockerFetcher = require('./blocker-fetcher')
const createCommentsFetcher = require('./comments-fetcher')

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
  const fetchComments = createCommentsFetcher(token)
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
      membership: {
        type: new GraphQLList(PersonType)
      },
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

  const PersonType = new GraphQLObjectType({
    name: 'Person',
    fields: () => ({
      id: {
        type: GraphQLInt
      },
      username: {
        type: GraphQLString
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

  const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => ({
      text: {
        type: GraphQLString
      },
      createdDate: {
        type: GraphQLString,
        resolve: root => root['created_at']
      },
      updatedDate: {
        type: GraphQLString,
        resolve: root => root['updated_at']
      },
      author: {
        type: GraphQLString,
        resolve: root => root['person_id']
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
          return fetchBlocker(story.project_id, story.id)
        }
      },
      labels: {
        type: new GraphQLList(GraphQLString),
        resolve: root => root.labels.map(label => label.name)
      },
      comments: {
        type: new GraphQLList(CommentType),
        resolve: (story, args, context) => {
          return fetchComments(story.project_id, story.id)
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
        }
      })
    })
  })
}

module.exports = createSchema
