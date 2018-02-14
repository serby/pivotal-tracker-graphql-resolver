const fetch = require('isomorphic-fetch')
const fetcher = account => async ({ projectId, topicId }) => {
  let url = `https://basecamp.com/${account}/api/v1/`
  if (projectId) {
    url += `/projects/${projectId}/topics/topicId.json`
  } else {
    url += `/topics.json`
  }
  return (await fetch(url, {
    headers: {
      'User-Agent': 'Clock (paul.serby@clock.co.uk)',
      'Authorization': 'Basic ' + Buffer.from('paul.serby@clock.co.uk:gKAxe!PR').toString('base64')
    }
  })).json()
}
module.exports = fetcher
