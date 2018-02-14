const basecampfetch = require('./fetcher')
const fetcher = account => async ({ projectId, topicId }) => {
  let url = `https://basecamp.com/${account}/api/v1/`
  if (projectId) {
    url += `/projects/${projectId}/topics${topicId ? '/' + topicId : ''}.json`
  } else {
    url += `/topics.json`
  }

  return basecampfetch(url)
}
module.exports = fetcher
