const fetch = require('isomorphic-fetch')
const fetcher = token => async (id, storyid) => {
  const response = (await fetch(`https://www.pivotaltracker.com/services/v5/projects/${id}/stories/${storyid}/blockers`, {
    headers: {
      'X-TrackerToken': token
    }
  }))
  return response.json()
}
module.exports = fetcher
