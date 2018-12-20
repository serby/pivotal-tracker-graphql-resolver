const fetch = require('isomorphic-fetch')
const fetcher = token => async (id, storyid) => {
  const url = `https://www.pivotaltracker.com/services/v5/projects/${id}/stories/${storyid}/comments`
  const response = (await fetch(url, {
    headers: {
      'X-TrackerToken': token
    }
  }))
  return response.json()
}
module.exports = fetcher
